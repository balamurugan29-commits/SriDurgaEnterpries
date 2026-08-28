package com.sridurga.service;

import com.sridurga.model.CustomerMaster;
import com.sridurga.repository.CustomerMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerMasterService {

    @Autowired
    private CustomerMasterRepository customerMasterRepository;

    public List<CustomerMaster> getAllCustomers() {
        return customerMasterRepository.findAllByOrderBySerialNumberAsc();
    }

    public Optional<CustomerMaster> getCustomerById(Long id) {
        return customerMasterRepository.findById(id);
    }

    public Optional<CustomerMaster> getCustomerByName(String name) {
        return customerMasterRepository.findByCustomerNameIgnoreCase(name);
    }

    public List<CustomerMaster> searchCustomers(String query) {
        return customerMasterRepository.findByCustomerNameContainingIgnoreCase(query);
    }

    public CustomerMaster createCustomer(CustomerMaster customer) {
        if (customer.getSerialNumber() == null) {
            customer.setSerialNumber(customerMasterRepository.getMaxSerialNumber() + 1);
        }
        return customerMasterRepository.save(customer);
    }

    public CustomerMaster updateCustomer(Long id, CustomerMaster customerDetails) {
        CustomerMaster existing = customerMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + id));

        existing.setCustomerName(customerDetails.getCustomerName());
        existing.setGstin(customerDetails.getGstin());
        existing.setPan(customerDetails.getPan());
        existing.setStateCode(customerDetails.getStateCode());
        existing.setPhone(customerDetails.getPhone());
        existing.setAddress(customerDetails.getAddress());
        existing.setPoNumber(customerDetails.getPoNumber());
        existing.setPoDate(customerDetails.getPoDate());
        existing.setVendorCode(customerDetails.getVendorCode());
        existing.setSacCode(customerDetails.getSacCode());
        existing.setContractNo(customerDetails.getContractNo());
        existing.setContractPeriod(customerDetails.getContractPeriod());
        existing.setBgNo(customerDetails.getBgNo());

        return customerMasterRepository.save(existing);
    }

    public void deleteCustomer(Long id) {
        customerMasterRepository.deleteById(id);
    }
}
