package com.oreedoo.lcm.DAOImp;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import com.oreedoo.lcm.dao.LcmLnkStateParameterDAO;
import com.oreedoo.lcm.entities.LcmLnkStateParameterEntity;
import com.oreedoo.lcm.entities.LcmLnkStateParameterEntityPK;



public class LcmLnkStateParameterDAOImp implements LcmLnkStateParameterDAO{
	
	@PersistenceContext(unitName="lcmPersistenceUnit")
	EntityManager em;

	@Override
	public LcmLnkStateParameterEntity getLnkStateParam() {
		
	 	LcmLnkStateParameterEntityPK ok= new LcmLnkStateParameterEntityPK("REAL_SERIVCE_STATUS", "INITIALE", 888);
	 	//"REAL_SERIVCE_STATUS","INITIALE", 888
		return em.find(LcmLnkStateParameterEntity.class, ok);
		
	}

}
