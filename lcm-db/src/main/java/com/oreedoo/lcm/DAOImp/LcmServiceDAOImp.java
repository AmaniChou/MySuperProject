package com.oreedoo.lcm.DAOImp;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.oreedoo.lcm.dao.LcmServiceDAO;
import com.oreedoo.lcm.entities.LcmServiceEntity;

public class LcmServiceDAOImp implements LcmServiceDAO {
	
	@PersistenceContext(unitName="lcmPersistenceUnit")
	EntityManager em;

	@Override
	public LcmServiceEntity getServiceById(long idService) {
		
		return em.find(LcmServiceEntity.class, idService);
	}

}
