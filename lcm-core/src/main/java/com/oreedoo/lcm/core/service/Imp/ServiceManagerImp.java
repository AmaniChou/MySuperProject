package com.oreedoo.lcm.core.service.Imp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oreedoo.lcm.core.service.ServiceManager;
import com.oreedoo.lcm.dao.LcmServiceDAO;
import com.oreedoo.lcm.entities.LcmServiceEntity;

@Transactional(readOnly = true)
@Service(value = "serviceManager")
public class ServiceManagerImp implements ServiceManager {
	
	@Autowired
	LcmServiceDAO lcmServiceDAO ;

	@Override
	public List<LcmServiceEntity> getAllServices() {
		
		return (List <LcmServiceEntity>)lcmServiceDAO.getServiceById(888);
	}

}
