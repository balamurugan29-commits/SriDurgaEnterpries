package com.sridurga.service;

import com.sridurga.model.CompanyDetails;
import com.sridurga.repository.CompanyDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CompanyDetailsService {

    @Autowired
    private CompanyDetailsRepository repository;

    @Transactional(readOnly = true)
    public CompanyDetails getCompanyDetails() {
        List<CompanyDetails> list = repository.findAll();
        if (list.isEmpty()) {
            CompanyDetails empty = new CompanyDetails();
            return repository.save(empty);
        }
        return list.get(0);
    }

    public CompanyDetails saveCompanyDetails(CompanyDetails updated) {
        List<CompanyDetails> list = repository.findAll();
        CompanyDetails existing;
        if (list.isEmpty()) {
            existing = new CompanyDetails();
        } else {
            existing = list.get(0);
        }

        existing.setCompanyName(updated.getCompanyName() != null ? updated.getCompanyName().trim() : "");
        existing.setAddress(updated.getAddress() != null ? updated.getAddress().trim() : "");
        existing.setPhone(updated.getPhone() != null ? updated.getPhone().trim() : "");
        existing.setEmail(updated.getEmail() != null ? updated.getEmail().trim() : "");
        existing.setGstin(updated.getGstin() != null ? updated.getGstin().trim() : "");
        existing.setPan(updated.getPan() != null ? updated.getPan().trim() : "");
        existing.setState(updated.getState() != null ? updated.getState().trim() : "");
        existing.setEpfCode(updated.getEpfCode() != null ? updated.getEpfCode().trim() : "");
        existing.setEsiCode(updated.getEsiCode() != null ? updated.getEsiCode().trim() : "");
        existing.setBankName(updated.getBankName() != null ? updated.getBankName().trim() : "");
        existing.setBranch(updated.getBranch() != null ? updated.getBranch().trim() : "");
        existing.setAccountNumber(updated.getAccountNumber() != null ? updated.getAccountNumber().trim() : "");
        existing.setIfscCode(updated.getIfscCode() != null ? updated.getIfscCode().trim() : "");
        existing.setContractNo(updated.getContractNo() != null ? updated.getContractNo().trim() : "");
        existing.setContractPeriod(updated.getContractPeriod() != null ? updated.getContractPeriod().trim() : "");
        existing.setBgNo(updated.getBgNo() != null ? updated.getBgNo().trim() : "");
        existing.setVendorCode(updated.getVendorCode() != null ? updated.getVendorCode().trim() : "");

        return repository.save(existing);
    }
}
