package com.sridurga.service;

import com.sridurga.dto.ProformaInvoiceRequest;
import com.sridurga.model.ProformaInvoice;
import com.sridurga.model.ProformaItem;
import com.sridurga.repository.ProformaInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProformaInvoiceService {

    @Autowired
    private ProformaInvoiceRepository proformaInvoiceRepository;

    @Transactional(readOnly = true)
    public List<ProformaInvoice> getAllProformas() {
        return proformaInvoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Optional<ProformaInvoice> getProformaById(Long id) {
        return proformaInvoiceRepository.findById(id);
    }

    /**
     * Generates Proforma Invoice Number in Indian Financial Year Format with 'PC/' prefix (e.g., "PC/01/26-27", "PC/02/26-27").
     * Uses persistent MAX sequence calculation.
     */
    public synchronized String generateNextProformaNumber() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue(); // 1 = Jan, 4 = April

        // Indian Financial Year: April 1 to March 31
        int startYear = (month >= 4) ? year : year - 1;
        int endYear = startYear + 1;

        String fySuffix = String.format("%02d-%02d", startYear % 100, endYear % 100);

        List<String> existingNumbers = proformaInvoiceRepository.findProformaNumbersBySuffix("/" + fySuffix);
        long maxSeq = 0;
        for (String num : existingNumbers) {
            if (num != null) {
                // e.g. "PC/01/26-27"
                String[] parts = num.split("/");
                if (parts.length >= 2) {
                    try {
                        long val = Long.parseLong(parts[1].trim());
                        if (val > maxSeq) {
                            maxSeq = val;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        long nextSeq = maxSeq + 1;
        return String.format("PC/%02d/%s", nextSeq, fySuffix);
    }

    public ProformaInvoice createProforma(ProformaInvoiceRequest request) {
        String proformaNum = (request.getProformaNumber() != null && !request.getProformaNumber().trim().isEmpty())
                ? request.getProformaNumber().trim()
                : generateNextProformaNumber();

        if (proformaInvoiceRepository.findByProformaNumber(proformaNum).isPresent()) {
            throw new IllegalArgumentException("Proforma Invoice Number '" + proformaNum + "' already exists.");
        }

        ProformaInvoice proforma = new ProformaInvoice();
        proforma.setProformaNumber(proformaNum);
        return saveProformaDetails(proforma, request);
    }

    public ProformaInvoice updateProforma(Long id, ProformaInvoiceRequest request) {
        ProformaInvoice proforma = proformaInvoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proforma Invoice with id " + id + " not found."));

        String newNum = (request.getProformaNumber() != null && !request.getProformaNumber().trim().isEmpty())
                ? request.getProformaNumber().trim()
                : proforma.getProformaNumber();

        if (!newNum.equalsIgnoreCase(proforma.getProformaNumber()) &&
                proformaInvoiceRepository.findByProformaNumber(newNum).isPresent()) {
            throw new IllegalArgumentException("Proforma Invoice Number '" + newNum + "' already exists.");
        }

        proforma.setProformaNumber(newNum);
        return saveProformaDetails(proforma, request);
    }

    public void deleteProforma(Long id) {
        proformaInvoiceRepository.deleteById(id);
    }

    private ProformaInvoice saveProformaDetails(ProformaInvoice proforma, ProformaInvoiceRequest request) {
        proforma.setProformaDate(request.getProformaDate() != null ? request.getProformaDate() : LocalDate.now());
        proforma.setCustomerName(request.getCustomerName());
        proforma.setCustomerAddress(request.getCustomerAddress());
        proforma.setCustomerPhone(request.getCustomerPhone());
        proforma.setVendorCode(request.getVendorCode());
        proforma.setPoNumber(request.getPoNumber());
        proforma.setPoDate(request.getPoDate());
        proforma.setEpfCode(request.getEpfCode());
        proforma.setEsiCode(request.getEsiCode());
        proforma.setGstin(request.getGstin());
        proforma.setPan(request.getPan());
        proforma.setStateCode(request.getStateCode());
        proforma.setCustomerPan(request.getCustomerPan());
        proforma.setCustomerGstin(request.getCustomerGstin());
        proforma.setCustomerStateCode(request.getCustomerStateCode());
        proforma.setSacCode(request.getSacCode());
        proforma.setGstPercent(request.getGstPercent() != null ? request.getGstPercent() : new BigDecimal("18"));
        proforma.setEquipmentHeader(request.getEquipmentHeader());
        proforma.setNotes(request.getNotes());

        // Replace Items
        proforma.getItems().clear();
        if (request.getItems() != null) {
            int seq = 1;
            for (ProformaInvoiceRequest.ProformaItemDto itemDto : request.getItems()) {
                ProformaItem item = new ProformaItem();
                item.setSerialNumber(itemDto.getSerialNumber() != null ? itemDto.getSerialNumber() : seq++);
                item.setItemCode(itemDto.getItemCode());
                item.setDescription(itemDto.getDescription());
                item.setUnit(itemDto.getUnit() != null ? itemDto.getUnit() : "No");
                item.setQuantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : BigDecimal.ZERO);
                item.setRate(itemDto.getRate() != null ? itemDto.getRate() : BigDecimal.ZERO);

                BigDecimal calculatedAmount = item.getQuantity().multiply(item.getRate());
                item.setAmount(itemDto.getAmount() != null ? itemDto.getAmount() : calculatedAmount);

                proforma.addItem(item);
            }
        }

        proforma.recalculateTotal();
        return proformaInvoiceRepository.save(proforma);
    }
}
