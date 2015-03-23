package com.oreedoo.lcm.entities;

import java.io.Serializable;

import javax.persistence.Column;


public class LcmLnkStateParameterEntityPK implements Serializable {

	@Column(name = "ID_STATE_PARAMETER")
	String id_state_parameter;

	@Column(name = "ID_STATE")
	String id_state;

	@Column(name = "SNCODE")
	long sncode;

	public String getId_state_parameter() {
		return id_state_parameter;
	}

	public String getId_state() {
		return id_state;
	}

	public long getSncode() {
		return sncode;
	}

	public LcmLnkStateParameterEntityPK() {
		super();
	}

	public LcmLnkStateParameterEntityPK(String id_state_parameter,
			String id_state, long sncode) {
		super();
		this.id_state_parameter = id_state_parameter;
		this.id_state = id_state;
		this.sncode = sncode;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((id_state == null) ? 0 : id_state.hashCode());
		result = prime
				* result
				+ ((id_state_parameter == null) ? 0 : id_state_parameter
						.hashCode());
		result = prime * result + (int) (sncode ^ (sncode >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		LcmLnkStateParameterEntityPK other = (LcmLnkStateParameterEntityPK) obj;
		if (id_state == null) {
			if (other.id_state != null)
				return false;
		} else if (!id_state.equals(other.id_state))
			return false;
		if (id_state_parameter == null) {
			if (other.id_state_parameter != null)
				return false;
		} else if (!id_state_parameter.equals(other.id_state_parameter))
			return false;
		if (sncode != other.sncode)
			return false;
		return true;
	}

}
