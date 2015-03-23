package com.oreedoo.lcm.DAOImp;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.oreedoo.lcm.dao.LcmContextHistoryDAO;
import com.oreedoo.lcm.entities.LcmContextHistoryEntity;

public class LcmContextHistoryDAOImp implements LcmContextHistoryDAO {
	
	@PersistenceContext(unitName="lcmPersistenceUnit")
	EntityManager em;

	@Override
	public LcmContextHistoryEntity getLcmContextHistory() {
		
		return em.find(LcmContextHistoryEntity.class, (long)4186985);
	}

}
