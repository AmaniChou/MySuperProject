package com.oreedoo.lcm.DAOImp;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.oreedoo.lcm.dao.LcmEventDAO;
import com.oreedoo.lcm.entities.LcmEventEntity;

public class LcmEventDAOImp implements LcmEventDAO{
	@PersistenceContext(unitName="lcmPersistenceUnit")
	EntityManager em;

	@Override
	public LcmEventEntity getEventByID(String id) {
		
		return em.find(LcmEventEntity.class,id);
	}



}
