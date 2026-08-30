package com.sridurga.service;

import com.sridurga.model.CompanyDetails;
import com.sridurga.repository.CompanyDetailsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CompanyDetailsService {

    @Autowired
    private CompanyDetailsRepository repository;

    @PostConstruct
    public void initDefaultCompanyDetails() {
        List<CompanyDetails> list = repository.findAll();
        if (list.isEmpty()) {
            CompanyDetails defaults = new CompanyDetails();
            repository.save(defaults);
        } else {
            CompanyDetails cd = list.get(0);
            boolean modified = false;
            if (cd.getCompanyName() == null || cd.getCompanyName().trim().isEmpty()) {
                cd.setCompanyName("SRI DURGA ENTERPRISES");
                modified = true;
            }
            if (cd.getAddress() == null || cd.getAddress().trim().isEmpty()) {
                cd.setAddress("No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602");
                modified = true;
            }
            if (cd.getPhone() == null || cd.getPhone().trim().isEmpty()) {
                cd.setPhone("9842492946");
                modified = true;
            }
            if (cd.getEmail() == null || cd.getEmail().trim().isEmpty()) {
                cd.setEmail("sridurgaenterprises@yahoo.com");
                modified = true;
            }
            if (cd.getGstin() == null || cd.getGstin().trim().isEmpty()) {
                cd.setGstin("34ABDFS4476N1ZN");
                modified = true;
            }
            if (cd.getPan() == null || cd.getPan().trim().isEmpty()) {
                cd.setPan("ABDFS4476N");
                modified = true;
            }
            if (cd.getState() == null || cd.getState().trim().isEmpty()) {
                cd.setState("Puducherry (34)");
                modified = true;
            }
            if (cd.getEpfCode() == null || cd.getEpfCode().trim().isEmpty()) {
                cd.setEpfCode("PC 1758");
                modified = true;
            }
            if (cd.getEsiCode() == null || cd.getEsiCode().trim().isEmpty()) {
                cd.setEsiCode("55000426770000602");
                modified = true;
            }
            if (cd.getBankName() == null || cd.getBankName().trim().isEmpty()) {
                cd.setBankName("Bank of India");
                modified = true;
            }
            if (cd.getBranch() == null || cd.getBranch().trim().isEmpty()) {
                cd.setBranch("Karaikal");
                modified = true;
            }
            if (cd.getAccountNumber() == null || cd.getAccountNumber().trim().isEmpty()) {
                cd.setAccountNumber("811030100000006");
                modified = true;
            }
            if (cd.getIfscCode() == null || cd.getIfscCode().trim().isEmpty()) {
                cd.setIfscCode("BKID0008110");
                modified = true;
            }
            if (cd.getContractNo() == null || cd.getContractNo().trim().isEmpty()) {
                cd.setContractNo("9010038288");
                modified = true;
            }
            if (cd.getContractPeriod() == null || cd.getContractPeriod().trim().isEmpty()) {
                cd.setContractPeriod("01.05.2024 to 30.04.2027");
                modified = true;
            }
            if (cd.getBgNo() == null || cd.getBgNo().trim().isEmpty()) {
                cd.setBgNo("8110IPEBG240001  Validity Upto : 30.09.2027");
                modified = true;
            }
            if (cd.getVendorCode() == null || cd.getVendorCode().trim().isEmpty()) {
                cd.setVendorCode("840305");
                modified = true;
            }
            if (modified) {
                repository.save(cd);
            }
        }
    }

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

        existing.setCompanyName(updated.getCompanyName() != null && !updated.getCompanyName().trim().isEmpty() ? updated.getCompanyName().trim() : "SRI DURGA ENTERPRISES");
        existing.setAddress(updated.getAddress() != null && !updated.getAddress().trim().isEmpty() ? updated.getAddress().trim() : "No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602");
        existing.setPhone(updated.getPhone() != null && !updated.getPhone().trim().isEmpty() ? updated.getPhone().trim() : "9842492946");
        existing.setEmail(updated.getEmail() != null && !updated.getEmail().trim().isEmpty() ? updated.getEmail().trim() : "sridurgaenterprises@yahoo.com");
        existing.setGstin(updated.getGstin() != null && !updated.getGstin().trim().isEmpty() ? updated.getGstin().trim() : "34ABDFS4476N1ZN");
        existing.setPan(updated.getPan() != null && !updated.getPan().trim().isEmpty() ? updated.getPan().trim() : "ABDFS4476N");
        existing.setState(updated.getState() != null && !updated.getState().trim().isEmpty() ? updated.getState().trim() : "Puducherry (34)");
        existing.setEpfCode(updated.getEpfCode() != null && !updated.getEpfCode().trim().isEmpty() ? updated.getEpfCode().trim() : "PC 1758");
        existing.setEsiCode(updated.getEsiCode() != null && !updated.getEsiCode().trim().isEmpty() ? updated.getEsiCode().trim() : "55000426770000602");
        existing.setBankName(updated.getBankName() != null && !updated.getBankName().trim().isEmpty() ? updated.getBankName().trim() : "Bank of India");
        existing.setBranch(updated.getBranch() != null && !updated.getBranch().trim().isEmpty() ? updated.getBranch().trim() : "Karaikal");
        existing.setAccountNumber(updated.getAccountNumber() != null && !updated.getAccountNumber().trim().isEmpty() ? updated.getAccountNumber().trim() : "811030100000006");
        existing.setIfscCode(updated.getIfscCode() != null && !updated.getIfscCode().trim().isEmpty() ? updated.getIfscCode().trim() : "BKID0008110");
        existing.setContractNo(updated.getContractNo() != null && !updated.getContractNo().trim().isEmpty() ? updated.getContractNo().trim() : "9010038288");
        existing.setContractPeriod(updated.getContractPeriod() != null && !updated.getContractPeriod().trim().isEmpty() ? updated.getContractPeriod().trim() : "01.05.2024 to 30.04.2027");
        existing.setBgNo(updated.getBgNo() != null && !updated.getBgNo().trim().isEmpty() ? updated.getBgNo().trim() : "8110IPEBG240001  Validity Upto : 30.09.2027");
        existing.setVendorCode(updated.getVendorCode() != null && !updated.getVendorCode().trim().isEmpty() ? updated.getVendorCode().trim() : "840305");

        return repository.save(existing);
    }
}
