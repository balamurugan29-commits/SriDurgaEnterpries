package com.sridurga.service;

import com.sridurga.dto.ChallanRequest;
import com.sridurga.model.ChallanItem;
import com.sridurga.model.DeliveryChallan;
import com.sridurga.repository.DeliveryChallanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DeliveryChallanService {

    @Autowired
    private DeliveryChallanRepository deliveryChallanRepository;

    public List<DeliveryChallan> getAllChallans() {
        return deliveryChallanRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<DeliveryChallan> getChallanById(Long id) {
        return deliveryChallanRepository.findById(id);
    }

    /**
     * Generates Tax Invoice Number in Indian Financial Year Format (e.g., "01/26-27", "02/26-27").
     * Automatically updates next April to new Financial Year ("01/27-28") and resets sequence counter to 01!
     */
    public String generateNextChallanNumber() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue(); // 1 = Jan, 4 = April

        // Indian Financial Year: April 1 to March 31
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;

        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        // Count existing invoices for the current Financial Year
        List<DeliveryChallan> allChallans = deliveryChallanRepository.findAll();
        long currentFyCount = allChallans.stream().filter(c -> {
            if (c.getChallanNumber() != null && c.getChallanNumber().endsWith(fySuffix)) {
                return true;
            }
            if (c.getChallanDate() != null) {
                int cYear = c.getChallanDate().getYear();
                int cMonth = c.getChallanDate().getMonthValue();
                int cStartYear = (cMonth >= 4) ? cYear : cYear - 1;
                return cStartYear == startYear;
            }
            return false;
        }).count();

        long nextSeq = currentFyCount + 1;
        return String.format("%02d/%s", nextSeq, fySuffix);
    }

    public DeliveryChallan createChallan(ChallanRequest request) {
        String challanNum = (request.getChallanNumber() != null && !request.getChallanNumber().trim().isEmpty())
                ? request.getChallanNumber().trim()
                : generateNextChallanNumber();

        if (deliveryChallanRepository.findByChallanNumber(challanNum).isPresent()) {
            throw new IllegalArgumentException("Tax Invoice Number '" + challanNum + "' already exists! Please use a unique Invoice Number or Edit the existing invoice.");
        }

        DeliveryChallan challan = new DeliveryChallan();
        challan.setChallanNumber(challanNum);
        return saveChallanDetails(challan, request);
    }

    public DeliveryChallan updateChallan(Long id, ChallanRequest request) {
        DeliveryChallan challan = deliveryChallanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tax Invoice not found with ID: " + id));

        if (request.getChallanNumber() != null && !request.getChallanNumber().trim().isEmpty()) {
            String newNum = request.getChallanNumber().trim();
            if (!challan.getChallanNumber().equalsIgnoreCase(newNum) &&
                    deliveryChallanRepository.findByChallanNumber(newNum).isPresent()) {
                throw new IllegalArgumentException("Tax Invoice Number '" + newNum + "' already exists!");
            }
            challan.setChallanNumber(newNum);
        }

        challan.getItems().clear(); // Clear old line items for clean replacement
        return saveChallanDetails(challan, request);
    }

    public void deleteChallan(Long id) {
        deliveryChallanRepository.deleteById(id);
    }

    private DeliveryChallan saveChallanDetails(DeliveryChallan challan, ChallanRequest request) {
        challan.setChallanDate(request.getChallanDate() != null ? request.getChallanDate() : LocalDate.now());
        challan.setCustomerName(request.getCustomerName());
        challan.setCustomerAddress(request.getCustomerAddress());
        challan.setCustomerPhone(request.getCustomerPhone());
        challan.setVendorCode(request.getVendorCode());
        challan.setPoNumber(request.getPoNumber());
        challan.setPoDate(request.getPoDate());
        challan.setEpfCode(request.getEpfCode());
        challan.setEsiCode(request.getEsiCode());
        challan.setGstin(request.getGstin());
        challan.setPan(request.getPan());
        challan.setStateCode(request.getStateCode());
        challan.setCustomerPan(request.getCustomerPan());
        challan.setCustomerGstin(request.getCustomerGstin());
        challan.setCustomerStateCode(request.getCustomerStateCode());
        challan.setSacCode(request.getSacCode());
        challan.setGstPercent(request.getGstPercent() != null ? request.getGstPercent() : new BigDecimal("18"));
        challan.setEquipmentHeader(request.getEquipmentHeader());
        challan.setNotes(request.getNotes());

        BigDecimal subtotal = BigDecimal.ZERO;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            int sno = 1;
            for (ChallanRequest.ChallanItemDto itemDto : request.getItems()) {
                ChallanItem item = new ChallanItem();
                item.setSerialNumber(itemDto.getSerialNumber() != null ? itemDto.getSerialNumber() : sno++);
                item.setItemCode(itemDto.getItemCode());
                item.setDescription(itemDto.getDescription());
                item.setQuantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : BigDecimal.ZERO);
                item.setRate(itemDto.getRate() != null ? itemDto.getRate() : BigDecimal.ZERO);
                item.calculateAmount();
                if (item.getAmount() != null) {
                    subtotal = subtotal.add(item.getAmount());
                }
                challan.addItem(item);
            }
        }

        BigDecimal gstPct = challan.getGstPercent() != null ? challan.getGstPercent() : new BigDecimal("18");
        BigDecimal gstAmount = subtotal.multiply(gstPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal calculatedGrossTotal = subtotal.add(gstAmount);

        if (request.getTotalAmount() != null && request.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            challan.setTotalAmount(request.getTotalAmount());
        } else {
            challan.setTotalAmount(calculatedGrossTotal);
        }

        return deliveryChallanRepository.save(challan);
    }
}
