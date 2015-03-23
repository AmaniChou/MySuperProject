package com.oreedoo.lcm;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.oreedoo.lcm.DAOImp.LcmLnkStateParameterDAOImp;
import com.oreedoo.lcm.dao.LcmLnkStateParameterDAO;



/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    
    {
    	@SuppressWarnings("resource")
		ApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring/context/application-context.xml");
    	
    	/*****************TEST EVENT**********************/
//    	EventDAOImp eventDAO=(EventDAOImp) applicationContext.getBean("EventDAO");
//      
//
//    	System.out.println(eventDAO.getEventByID("RECHARGE_DETECTOR").getEventName()+
//    			" Version: "+eventDAO.getEventByID("RECHARGE_DETECTOR").getVersion()+
//    			" ,Description : "+eventDAO.getEventByID("RECHARGE_DETECTOR").getDescription() );
    	
    	/*****************TEST LcmContextHistory**************/
//
//    	LcmContextHistoryDAOImp contextHi=(LcmContextHistoryDAOImp) applicationContext.getBean("LcmContextHistoryDAO");
//    	System.out.println("MSISDN :"+contextHi.getLcmContextHistory().getMsisdn()+ "SNCODE :"+contextHi.getLcmContextHistory().getSncode()
//   			 );
//    	
    	
    	/*****************TEST LcmContextHistory**************/
//
//    	LcmServiceDAOImp Ser=(LcmServiceDAOImp) applicationContext.getBean("LcmServiceDAO");
//    	System.out.println("Name :"+Ser.getServiceById(257).getName() );
//    
      	/*****************TEST LcmLnkStateParameterDAO**************/

    	LcmLnkStateParameterDAO StateParam=(LcmLnkStateParameterDAOImp) applicationContext.getBean("LcmLnkStateParameterDAO");
    	
        	System.out.println("State Name :"+StateParam.getLnkStateParam().getId_state() +"  Real State: "+ StateParam.getLnkStateParam().getValue());
    	
    }
}
