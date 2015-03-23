package com.oreedoo.lcm.entities;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

	@Entity
	@Table(name="LCM_EVENT")
	public class LcmEventEntity {
		
		@Id
		@Column(name="Event_Name")
		String eventName;
		int version;
		String description ;
		
		public LcmEventEntity() {
		
		}
		
		public LcmEventEntity(String eventName, int version, String description) {
			super();
			this.eventName = eventName;
			this.version = version;
			this.description = description;
		}
		public String getEventName() {
			return eventName;
		}
		public void setEventName(String eventName) {
			this.eventName = eventName;
		}
		public int getVersion() {
			return version;
		}
		public void setVersion(int version) {
			this.version = version;
		}
		public String getDescription() {
			return description;
		}
		public void setDescription(String description) {
			this.description = description;
		}
		
		

}
