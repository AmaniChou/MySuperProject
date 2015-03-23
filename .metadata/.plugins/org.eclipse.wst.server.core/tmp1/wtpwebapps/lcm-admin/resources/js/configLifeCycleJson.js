//Paramèters par défaut//
jsPlumb.importDefaults({
	ConnectionsDetachable : false,
	Endpoint : [ "Dot", {
		radius : 3
	} ],
	EndpointStyles : [ {
		fillStyle : 'gray'
	}, {
		fillStyle : '#222288'
	} ],
	HoverPaintStyle : {
		strokeStyle : "#222288",
		lineWidth : 3
	},
	ConnectionOverlays : [ [ "Arrow", {
		location : 0.99
	} ], [ "Label", {
		label : "Non evenement",
		location : 0.4,
		id : "label",
		cssClass : "aLabel"
	} ] ],
	ConnectorZIndex : 5
});

var connectorPaintStyle = {
	lineWidth : 2,
	strokeStyle : "blue",
	joinstyle : "round",
	outlineColor : "blue",
	outlineWidth : 2
};

// Variables//
var actualState_Id = 0;
var d = -1;
var sourceState_Name = "";
var targetState_Name = "";
var stateMap = new Array();
var MAP_Connect = new Array();
var events_Name = [ "ACTIVATION", "DESACTIVATION", "DATE_ATTEINTE",
		"RECHARGE_DETECTOR", "PRELEVEMENT" ];
var save = false;
var actualState_Source = "";
var currentSncode = null;
var currentName=null;
var serviceRenewalFee=null;
var birthDayFlag=null;
var activationDateStrategy="";
var preActionFlag=null;
var rtcg_REQUEST_PARAM_1_RTCG_CODEValue="";
var rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue="";
var packageNameValue="";
var chargeModeValue="";
var voms_WS_ACTIONFlag=null;
var transitionsToDelete = new Array();
var clickedStateId = 0;
var transitionSource = 0;
var transitionTarget = 0;
var clickedEndPoint = 0;
var lifecycle;
var lastStateId = 0;
var lastTransitionId = 0;
var lifeCycleUpdated;
var stateColors = [];

// ///////////////// Retourner l'id de l'état ////////////////////////
function getStateID(stateToFind) {
	var stateList = lifecycle.states.state;
	var find = false;
	stateList.forEach(function(entry) {

		state_name = entry.stateName;
		if (state_name == stateToFind) {
			stateId = entry.stateId;
			find = true;
		}

	});
	if (find)
		return stateId;
	else
		return 0;

}

function getStatesIdByName(stateToFind) {
	var i = 4;
	var find = false;
	while (find == false && i < stateMap.length) {
		state_name = stateMap[i].name;
		if (state_name == stateToFind) {
			stateId = i;
			find = true;
		}
		i++;
	}
	if (find)
		return stateId;
	else
		return 0;
}

// ////////////////////////////showStateDialog//////////////////////////////////////
var removeFromStatesList = "";
function showStateDialog(lastStateId) {
	console.debug("show dialog init State call");
	clickedStateId = lastStateId;
	stateInitDlg.show();
}

// ////////////////////////////checkStateParam/////////////////////////////////////////
function checkStateParam() {
	if (save == false) {
		var remove = document.getElementById(clickedStateId);
		remove.parentNode.removeChild(remove);
		lastStateId--;
	}
}

// ////////////////////////////initStateParameters///////////////////////////////////////
function initStateParameters(xhr, status, args) {
	if (args.validationFailed) {
		alert("Validation Failed");
	} else {
		console.debug("hide init State dialog call");
		if (args.stateParameters.stateName != "") {
			save = true;
			var currentState = document.getElementById(clickedStateId);
			var stateName = document.createElement('strong');
			stateName.innerHTML = args.stateParameters.stateName;
			currentState.appendChild(stateName);
			var period = document.createElement('h4');
			var M = args.stateParameters.months;
			var D = args.stateParameters.days;
			var H = args.stateParameters.hours;
			var mSignal = args.stateParameters.monthSignal;
			var dSignal = args.stateParameters.daySignal;
			var hSignal = args.stateParameters.hourSignal;
			period.innerHTML = "P= " + mSignal + M + "M " + dSignal + D + "D "
					+ hSignal + H + "H";
			currentState.appendChild(period);
			var sourcePoint = document.createElement('div');
			sourcePoint.setAttribute('class', 'ep');
			currentState.appendChild(sourcePoint);
			stateMap[clickedStateId].name = args.stateParameters.stateName;
			stateMap[clickedStateId].period = mSignal + M + "M " + dSignal + D
					+ "D " + hSignal + H + "H";
			stateMap[clickedStateId].rechargeDetector = args.stateParameters.rechargeDetector;
			stateMap[clickedStateId].realStatus = args.stateParameters.stateRealStatus;
			removeFromStatesList = "";
			$(".state").each(
					function(i, e) {
						jsPlumb.makeSource($(e), {
							connectionsDetachable : false,
							filter : ".ep",
							connectorStyle : {
								lineWidth : 3,
								strokeStyle : "rgb(100, 100, 100)",
								joinstyle : "round",
								outlineColor : "round",
								outlineWidth : 2,
							},
							connector : [ "Flowchart", {
								stub : [ 40, 40 ],
								gap : 10,
							} ],
							anchor : "Continuous",
							maxConnections : 10,
							onMaxConnections : function(info, e) {
								alert("Maximum connections ("
										+ info.maxConnections + ") reached");
							}
						});
					});
			jsPlumb.makeTarget($(".state"), {
				dropOptions : {
					hoverClass : "dragHover"
				},
				anchor : "Continuous",
				deleteEndpointsOnDetach : false
			});
			jsPlumb.bind("connection", function(info) {
				info.connection.getOverlay("label").setLabel(
						"Configurer cette transition");

			});
		}
		stateInitDlg.hide();
		clickedStateId = null;
	}
}

// ///////////////////showEditStateDialog(stateId) //////////////////////////
function showEditStateDialog(stateId) {
	var clickedState = stateMap[stateId];
	console.debug("State ID de cet Etat : " + stateId);
	clickedStateRemoteCmd([ {
		name : "clickedStateParameters",
		value : clickedState.name + ',' + clickedState.period + ','
				+ clickedState.rechargeDetector + '#' + clickedState.realStatus
	} ]);
	console.debug("show dialog edit State call");
	stateEditDlg.show();
	actualState_Id = stateId;
}

// ///////////////////editStateParameters(xhr, status, args)
// //////////////////////////
function editStateParameters(xhr, status, args) {
	if (args.validationFailed) {
		alert("Validation Failed");
	} else {
		// if (args.stateParameters.stateName != "") {
		save = true;
		var currentState = document.getElementById(actualState_Id);
		currentState.firstChild.innerHTML = args.stateParameters.stateName;
		var x = jsPlumb.getDefaultScope();
		jsPlumb.select({
			scope : x
		}).each(function(connection) {
			if (connection.sourceState_Name == stateMap[actualState_Id].name) {
				connection.sourceState_Name = args.stateParameters.stateName;
			}
			if (connection.targetState_Name == stateMap[actualState_Id].name) {
				connection.targetState_Name = args.stateParameters.stateName;
				alert(connection.targetState_Name);
			}
		});
		var M = args.stateParameters.months;
		var D = args.stateParameters.days;
		var H = args.stateParameters.hours;
		var mSignal = args.stateParameters.monthSignal;
		var dSignal = args.stateParameters.daySignal;
		var hSignal = args.stateParameters.hourSignal;
		currentState.childNodes[1].innerHTML = "P= " + mSignal + M + "M "
				+ dSignal + D + "D " + hSignal + H + "H";
		stateMap[actualState_Id].name = args.stateParameters.stateName;
		stateMap[actualState_Id].period = mSignal + M + "M " + dSignal + D
				+ "D " + hSignal + H + "H";
		stateMap[actualState_Id].rechargeDetector = args.stateParameters.rechargeDetector;
		stateMap[actualState_Id].realStatus = args.stateParameters.stateRealStatus;
		// }
		console.debug("hide edit State dialog call");
		stateEditDlg.hide();
		actualState_Id = null;
	}
}

// ///////////////////showTransitionInitDialog//////////////////////////
function showTransitionInitDialog(connection) {
	transitionSource = connection.sourceId;
	transitionTarget = connection.targetId;
	console.debug("show dialog Init call");
	transitionInitDlg.show();
}

// ///////////////////
// initTransitionParameters(xhr,status,args)//////////////////////////
function initTransitionParameters(xhr, status, args) {
	console.debug("hide dialog call");
	init = function(conn) {
		conn.getOverlay("label").setLabel(args.transitionParameters.eventName);
		lastTransitionId++;
		conn.connectionId = lastTransitionId;
		conn.eventname = args.transitionParameters.eventName;
		conn.doPreAction = args.transitionParameters.doPreAction;
		if (conn.doPreAction == "true") {
			conn.connectionFlag = args.transitionParameters.transitionFlag;
		} else {
			conn.connectionFlag = "Ok";
		}
		console.log("transitionSource: " + transitionSource);
		conn.sourceState_Name = document.getElementById(transitionSource).firstChild.innerHTML;
		conn.targetState_Name = document.getElementById(transitionTarget).firstChild.innerHTML;
		conn.done = false;
		if (args.transitionParameters.packageName != null) {
			conn.postActionPackageName = args.transitionParameters.packageName;
			conn.postActionChargeMode = args.transitionParameters.chargeMode;
		}
		console.log(args.transitionParameters.packageName);
		console.log(args.transitionParameters.chargeMode);

		if (args.transitionParameters.processName != null) {
			conn.postActionProcessName = args.transitionParameters.processName;
		}
		console.log(args.transitionParameters.processName);

		if (args.transitionParameters.disactivate_SERVICE != null) {
			conn.postActionDisactivate_SERVICE = args.transitionParameters.disactivate_SERVICE;
		}
		console.log("conn.postActionDisactivate_SERVICE : "
				+ conn.postActionDisactivate_SERVICE);
		if (args.transitionParameters.add_TO_CRBT_BLACKLIST != null) {
			conn.postActionAdd_TO_CRBT_BLACKLIST = args.transitionParameters.add_TO_CRBT_BLACKLIST;
		}
		console.log("conn.postActionAdd_TO_CRBT_BLACKLIST : "
				+ conn.postActionAdd_TO_CRBT_BLACKLIST);

		if (args.transitionParameters.resume_FROM_CRBT_BLACKLIST != null) {
			conn.posActionResume_FROM_CRBT_BLACKLIST = args.transitionParameters.resume_FROM_CRBT_BLACKLIST;
		}
		console.log("conn.posActionResume_FROM_CRBT_BLACKLIST : "
				+ conn.posActionResume_FROM_CRBT_BLACKLIST);

	};
	jsPlumb.bind("connection", function(connInfo, originalEvent) {
		init(connInfo.connection);
	});
	jsPlumb.connect({
		source : transitionSource,
		target : transitionTarget
	});
	transitionInitDlg.hide();

	transitionSource = null;
	transitionTarget = null;
}

// ////////////////showTransitionEditDialog///////////////////////////
function showTransitionEditDialog(connection) {
	clickedTransitionRemoteCmd([ {
		name : "clickedTransitionParameters",
		value : connection.eventname + ',' + connection.connectionId + ','
				+ connection.doPreAction + ',' + connection.postAction + ','
	} ]);
	console.debug("show Transition EDIT dialog call");
	transitionEditDlg.show();
}

// //////////////updateTransitionParameters///////////////////////////
function updateTransitionParameters(xhr, status, args) {
	if (args.validationFailed) {
		alert("Validation Failed");
	} else {
		console.debug("hide dialog call");
		init = function(conn) {
			conn.getOverlay("label").setLabel(
					args.transitionParameters.eventName);
			conn.eventname = args.transitionParameters.eventName;
			// lastTransitionId++;
			conn.connectionId = lastTransitionId;
			conn.connectionFlag = conn.connectionFlag;
			conn.doPreAction = conn.doPreAction;
			conn.postAction = conn.postAction;
			conn.done = false;
			transitionEditDlg.hide();
		};
		jsPlumb.bind("connection", function(connInfo, originalEvent) {
			init(connInfo.connection);
		});
		jsPlumb.connect({
			source : transitionSource,
			target : transitionTarget
		});
	}
}

// /////////////////addState()//////////////////////////
var globalElement;
function addState() {
	// sets the draggable and define its options
	$('#3.window').draggable({
		cursor : 'move', // sets the cursor apperance
		revert : 'invalid', // makes the item to return if it isn't
		// placed into chart lifecycle area
		revertDuration : 70, // duration while the item returns
		// to its place
		start : function(event, ui) {
			globalElement = $(this);
		},
		stop : function(event, ui) {
			globalElement = null;
		},
	});
	$(document).ready(
			function() {
				// define options for droppable windows
				$('#lifeCycleChart').droppable(
						{
							activeClass : 'changeColor',
							drop : function(event, ui) {
								if (ui.draggable.attr("id") == 3) {
									var Palette = document
											.getElementById('Palette');
									var stateToAdd = document
											.createElement('div');
									stateToAdd.setAttribute('id', 3);
									stateToAdd.setAttribute('class', 'window');
									Palette.appendChild(stateToAdd);
									$('#3.window').draggable({
										cursor : 'move',
										revert : 'invalid',
										revertDuration : 70,
										start : function(event, ui) {
											globalElement = $(this);
										},
										stop : function(event, ui) {
											globalElement = null;
										},
									});
									lastStateId++;
									console.log("lastStateId" + lastStateId);
									ui.draggable.attr("id", lastStateId);
									ui.draggable.attr("class",
											"state ui-draggable ");
									save = false;
									showStateDialog(lastStateId);
									console.log("lastID=:" + lastStateId);
									globalElement.detach().appendTo($(this));
									stateMap[lastStateId] = ui.draggable;
									ui.draggable.attr('ondblclick',
											'showEditStateDialog('
													+ lastStateId + ')');
								}
							}
						});
			});
}

var stateId = 3;
// /////Appel au controleur pour retourner le modèle JSON///////////
function serviceCycle() {
	initStateColors();
	$
			.getJSON(
					"http://localhost:9090/lcm-admin/lcmMvc/controllerJSON2/getJSON",
					function(data) {
						lifecycle = data;
						console
								.log('/******************************************//////////////////****************');
						console.log("Le sncode du service:" + lifecycle.sncode);
						console.log("le nom du service" + lifecycle.name);
						console.log("le dernier StateId: "
								+ lifecycle.states.lastStateId);
						console
								.log('/******************************************//////////////////****************');

						jsPlumb.bind("beforeDrop", function(info) {
							showTransitionInitDialog(info);
						});
						jsPlumb.bind("click", function(connection) {
							showTransitionEditDialog(connection);
						});
						jsPlumb
								.bind(
										"contextmenu",
										function(conn) {
											if (confirm("VOULEZ VOUS SUPPRIMER CETTE TRANSITION ?"))
												jsPlumb.detach(conn);
											// / if (conn.connectionId <
											// lastTransitionId) {
											d++;
											transitionsToDelete[d] = conn.connectionId;

											// }
										});

						// //////////////////////////StatesJSON//////////////////////////////
						lastStateId = lifecycle.states.lastStateId;
						console.log("StatesJSON :LastStateID" + lastStateId);
						currentSncode = lifecycle.sncode;
						currentName= lifecycle.name;
						serviceRenewalFee=lifecycle.serviceRenewalFee;
						console.log("serviceRenewalFee :"+serviceRenewalFee);
						birthDayFlag=lifecycle.birthDayFlag;
						console.log("birthDayFlag :"+birthDayFlag);
						activationDateStrategy=lifecycle.activationDateStrategy;
						console.log("activationDateStrategy :"+activationDateStrategy);
						preActionFlag=lifecycle.preActionFlag;
						console.log("preActionFlag :"+preActionFlag);
						rtcg_REQUEST_PARAM_1_RTCG_CODEValue=lifecycle.rtcg_REQUEST_PARAM_1_RTCG_CODEValue;
						console.log("rtcg_REQUEST_PARAM_1_RTCG_CODEValue :"+rtcg_REQUEST_PARAM_1_RTCG_CODEValue);
						rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue=lifecycle.rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue;
						console.log("rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue :" +rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue);
						packageNameValue=lifecycle.packageNameValue;
						console.log("packageNameValue :"+packageNameValue);
						chargeModeValue=lifecycle.chargeModeValue;
						console.log("chargeModeValue :"+chargeModeValue);
						voms_WS_ACTIONFlag=lifecycle.voms_WS_ACTIONFlag;
						console.log("voms_WS_ACTIONFlag :"+voms_WS_ACTIONFlag);
						var stateList = lifecycle.states.state;
						var top = 440;
						var left = 50;
						var bool = 0;
						stateList
								.forEach(function(entry) {
									var paramList = new Array();
									paramList = entry.stateParam;
									var state_name = entry.stateName;
									var stateId = entry.stateId;
									var chart = document
											.getElementById('lifeCycleChart');
									var state = document.createElement('div');
									state.setAttribute('id', stateId);
									state.setAttribute('class', 'state');
									state.setAttribute('ondblclick',
											'showEditStateDialog(' + stateId
													+ ')');
									state.style.left = left;
									state.style.top = top;
									chart.appendChild(state);

									state.style.backgroundColor = getStateColor(state_name);

									if (bool == 0) {
										top = top - 360;
										left = left + 100;
										bool = 1;
									} else {
										top = top + 650;
										left = left + 350;
										bool = 0;
									}
									var name = document.createElement('strong');
									name.innerHTML = state_name;
									state.appendChild(name);
									var rechargeDetector = paramList[0].value;
									var state_period = paramList[1].value;
									var realStatus = paramList[2].value;
									var period = document.createElement('h4');
									period.innerHTML = "P= " + state_period;
									state.appendChild(period);
									var sourcePoint = document
											.createElement('div');

									sourcePoint.setAttribute('class', 'ep');
									state.appendChild(sourcePoint);
									state.name = state_name;
									state.period = state_period;
									state.rechargeDetector = rechargeDetector;
									state.realStatus = realStatus;
									stateMap[stateId] = state;
									console
											.log("*** Les parametres de l'etat ****");
									console.log(" L'id de l'etat: " + stateId);
									console.log(" Le nom de l'etat: "
											+ state_name);
									console.log(" RechargeDetactor:  "
											+ state.rechargeDetector);
									console.log("  Period:  " + state.period);
									console.log(" RealStatus : "
											+ state.realStatus);
									console
											.log("                                        ");

								});
						jsPlumb.draggable(jsPlumb.getSelector(".state"));
						$(".state").each(
								function(i, e) {
									jsPlumb.makeSource($(e), {
										connectionsDetachable : false,
										filter : ".ep",
										connectorStyle : {
											lineWidth : 2,
											strokeStyle : "#990000",
											joinstyle : "round",
											outlineColor : "#EAEDEF",
											outlineWidth : 3,
										},
										connector : [ "Flowchart", {
											stub : [ 40, 40 ],
											gap : 10,
										} ],
										anchor : "Continuous",
										maxConnections : 10,
										onMaxConnections : function(info, e) {
											alert("Maximum connections ("
													+ info.maxConnections
													+ ") reached");
										}
									});
								});
						jsPlumb.makeTarget($(".state"), {
							dropOptions : {
								hoverClass : "dragHover"
							},
							anchor : "Continuous",
							deleteEndpointsOnDetach : false
						});

						// //////////////////////////////////////////////////////////////////
						// //////////////////////////EventsJSON//////////////////////////////
						console
								.log("*************getEventsJSON()******************");
						lastTransitionId = lifecycle.transitions.lastTransitionId;
						console.log(" lastTransitionId *getEventsJSON()*: "
								+ lastTransitionId);
						var eventList = lifecycle.transitions.event;
						var event_name = null;
						var id = null;
						var doPreAction = null;
						var postAction = null;
						var target_state_ok = null;
						var target_state_ko = null;
						eventList
								.forEach(function(entry) {

									event_name = entry.name;

									var transitionList = entry.transition;
									transitionList
											.forEach(function(entry2) {

												id = entry2.id;
												console
														.log(" L'id de l'evenement : "
																+ id);
												if (entry2.doPreAction != null)
													doPreAction = entry2.doPreAction;
												console.log(" Preaction : "
														+ doPreAction);
												var source_state = entry2.sourceState;
												console.log(" L'etat source : "
														+ source_state);

												var source_state_id;
												/** *********************** */
												var stateList = lifecycle.states.state;
												var find = false;
												stateList
														.forEach(function(entry) {

															state_name = entry.stateName;
															if (state_name == source_state) {
																stateId = entry.stateId;
																find = true;
															}
														});
												if (find)
													source_state_id = stateId;
												else
													source_state_id = 0;

												/** ********************** */
												console
														.log(" source_state_id : "
																+ source_state_id);
												if (entry2.targetStateOk != null) {
													var flagOk = "Ok";
													target_state_ok = entry2.targetStateOk;
													console
															.log(" target_state_ok  : "
																	+ target_state_ok);

													var target_state_id;
													/** *********************** */
													var stateList = lifecycle.states.state;
													var find = false;
													stateList
															.forEach(function(
																	entry) {

																state_name = entry.stateName;
																if (state_name == target_state_ok) {
																	stateId = entry.stateId;
																	find = true;
																}
															});
													if (find)
														target_state_id = stateId;
													else
														target_state_id = 0;

													/** ********************* */
													console
															.log(" target_state_id_Ko : "
																	+ target_state_id);

													if (target_state_id != 0) {
														targetState = target_state_ok;
														if (entry2.postActionOk != null)
															postAction = entry2.postActionOk;
														init = function(
																connection) {
															connection.eventname = event_name;
															connection.connectionId = id;
															connection.sourceState_Name = source_state;
															connection.connectionFlag = flagOk;
															connection.targetState_Name = target_state_ok;
															connection.doPreAction = doPreAction;
															connection.postAction = postAction;
															connection.done = false;
															connection
																	.getOverlay(
																			"label")
																	.setLabel(
																			event_name);
														};
														jsPlumb
																.bind(
																		"connection",
																		function(
																				connInfo,
																				originalEvent) {
																			init(connInfo.connection);
																		});
														var source_str = source_state_id
																.toString();
														var target_str = target_state_id
																.toString();
														jsPlumb
																.connect({
																	source : source_str,
																	target : target_str,
																});
													}
													id = null;
													doPreAction = null;
													targetState = null;
													postAction = null;
												}

												if (entry2.targetStateKo != null) {
													var flagKo = "Ko";
													target_state_ko = entry2.targetStateKo;
													console
															.log(" target_state_ko  : "
																	+ target_state_ko);

													var target_state_Ko_ID;
													/** *********************** */
													var stateList = lifecycle.states.state;
													var find = false;
													stateList
															.forEach(function(
																	entry) {

																state_name = entry.stateName;
																if (state_name == target_state_ko) {
																	stateId = entry.stateId;
																	find = true;
																}
															});
													if (find)
														target_state_Ko_ID = stateId;
													else
														target_state_Ko_ID = 0;

													/** ********************** */
													console
															.log(" target_state_ko  : "
																	+ target_state_ko);

													if (target_state_Ko_ID != 0) {
														targetState = target_state_ko;
														if (entry2.postActionKo != null)
															postAction = entry2.postActionKo;
														console
																.log(" postActionKo  : "
																		+ postAction);
														console
																.log("                        ");
														init = function(
																connection) {
															connection.eventname = event_name;
															connection.connectionId = id;
															connection.sourceState_Name = source_state;
															connection.connectionFlag = flagKo;
															connection.targetState_Name = target_state_ko;
															connection.doPreAction = doPreAction;
															connection.postAction = postAction;
															connection.done = false;
															connection
																	.getOverlay(
																			"label")
																	.setLabel(
																			event_name);
														};
														jsPlumb
																.bind(
																		"connection",
																		function(
																				connInfo,
																				originalEvent) {
																			init(connInfo.connection);
																		});

														var source_str = source_state_id
																.toString();
														var target_str = target_state_Ko_ID
																.toString();
														jsPlumb
																.connect({
																	source : source_str,
																	target : target_str,
																});

													}
													id = null;
													doPreAction = null;
													targetState = null;
													postAction = null;
												}

											});

									event_name = null;
								});
						// //////////////////////////////////////////////////////////////////

					});
	addState();
}
window.onload = serviceCycle;

// /////////////////UPDATE LIFECYCLE///////////////////////
function setCycle_Config() {
	var deletedTransitions = "";
	// Objet JSON POST
	lifeCycleUpdated = {
		states : {
			state : [],
			lastStateId : 0
		},
		transitions : {
			event : [],
			lastTransitionId : 0,
			lastPostActionId : 0,
			lastIdPostAction : 0,
			deletedTransitions : null
		},
		sncode : 0,
		name : null,
		serviceRenewalFee : 0,
		birthDayFlag :null,
		activationDateStrategy: null,
		preActionFlag : null,
		rtcg_REQUEST_PARAM_1_RTCG_CODEValue : null,
		rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue: null,
		packageNameValue: null,
		chargeModeValue :null,
		voms_WS_ACTIONFlag : null,
		dateBeginSimulation : null,
		dateEndSimulation : null,
		dateRecharge : null
	};

	var stateParamObject = [];

	if (d > -1) {
		for ( var k = 0; k < transitionsToDelete.length; k++) {
			deletedTransitions = deletedTransitions + transitionsToDelete[k]
					+ "/";
			console.log("Transition to delete :" + transitionsToDelete[k]);
		}
	}
	console.log("****************************************************");
	console.log("******************TEST POST*************************");
	lifeCycleUpdated.sncode = currentSncode.toString();
	console.log("sncode du service" + lifeCycleUpdated.sncode);
	console.log("*****************TEST STATE POST*********************");
	lifeCycleUpdated.name=currentName;
	lifeCycleUpdated.serviceRenewalFee=serviceRenewalFee.toString();
	console.log("lifeCycleUpdated.serviceRenewalFee :"+lifeCycleUpdated.serviceRenewalFee);
	lifeCycleUpdated.birthDayFlag=birthDayFlag.toString();
	console.log("lifeCycleUpdated.birthDayFlag :"+lifeCycleUpdated.birthDayFlag);
	lifeCycleUpdated.activationDateStrategy=activationDateStrategy;
	console.log("lifeCycleUpdated.activationDateStrategy :"+lifeCycleUpdated.activationDateStrategy);
	lifeCycleUpdated.preActionFlag=preActionFlag.toString();
	console.log("lifeCycleUpdated.preActionFlag :"+lifeCycleUpdated.preActionFlag);
	lifeCycleUpdated.rtcg_REQUEST_PARAM_1_RTCG_CODEValue=rtcg_REQUEST_PARAM_1_RTCG_CODEValue;
	console.log("lifeCycleUpdated.rtcg_REQUEST_PARAM_1_RTCG_CODEValue :"+lifeCycleUpdated.rtcg_REQUEST_PARAM_1_RTCG_CODEValue);
	lifeCycleUpdated.rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue=rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue;
	console.log("lifeCycleUpdated.rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue :"+lifeCycleUpdated.rtcg_REQUEST_PARAM_2_XML_MESSAGE_TEMPLATEValue);
	lifeCycleUpdated.packageNameValue=packageNameValue;
	console.log("lifeCycleUpdated.packageNameValue :" +lifeCycleUpdated.packageNameValue);
	lifeCycleUpdated.chargeModeValue=chargeModeValue;
	console.log("lifeCycleUpdated.chargeModeValue :"+lifeCycleUpdated.chargeModeValue);
	lifeCycleUpdated.voms_WS_ACTIONFlag=voms_WS_ACTIONFlag.toString();
	console.log("lifeCycleUpdated.voms_WS_ACTIONFlag : "+lifeCycleUpdated.voms_WS_ACTIONFlag);
	for ( var j = 4; j < stateMap.length; j++) {
		var stateObject = {
			stateParam : [],
			stateName : null,
			stateId : 0,
			periodState : null
		};
		if (stateMap[j].name != null) {

			var stateNamemodel = stateMap[j].name;
			console.log("stateName" + j + ":  " + stateNamemodel);
			var stateIDmodel = j;
			console.log("stateID" + j + ":  " + stateIDmodel);
			stateParamObject.push({
				parameter : "PERIOD",
				value : stateMap[j].period
			});
			console.log("statePERIOD" + j + ":  " + stateMap[j].period);
			stateParamObject.push({
				parameter : "IF_RECHARGE_DETECTOR",
				value : stateMap[j].rechargeDetector
			});
			console.log("stateRechargeDetector" + j + ":  "
					+ stateMap[j].rechargeDetector);
			stateParamObject.push({
				parameter : "REAL_SERIVCE_STATUS",
				value : stateMap[j].realStatus
			});
			console.log("stateREAL_SERIVCE_STATUS" + j + ":  "
					+ stateMap[j].realStatus);
			stateObject.stateId = stateIDmodel;
			stateObject.stateName = stateNamemodel;
			stateObject.stateParam = stateParamObject;
			lifeCycleUpdated.states.state.push(stateObject);
			stateParamObject = [];

		}
	}

	var connectionList = jsPlumb.getConnections();
	console.log("La liste des connexions: " + connectionList.toString());
	console.log("*****************TEST EVENT POST*********************");
	lifeCycleUpdated.transitions.deletedTransitions = deletedTransitions;
	for ( var e = 0; e < events_Name.length; e++) {
		var eventObject = {
			transition : [],
			name : null
		};
		eventObject.name = events_Name[e];
		console.log("eventName" + e + ":  " + eventObject.name);
		var x = jsPlumb.getDefaultScope();
		jsPlumb
				.select({
					scope : x
				})
				.each(
						function(currentConnection) {
							var transitionObject = {
								doPreAction : null,
								sourceState : null,
								targetStateOk : null,
								targetStateKo : null,
								postActionOk : null,
								postActionKo : null,
								id : 0,
								postActionOkProcessName : null,
								postActionOkPackageName : null,
								postActionOkChargeMode : null,
								postActionOk_ADD_TO_CRBT_BLACKLIST : null,
								postActionOk_RESUME_FROM_CRBT_BLACKLIST : null,
								postActionOk_DISACTIVATE_SERVICE : null,
								postActionKoProcessName : null,
								postActionKoPackageName : null,
								postActionKoChargeMode : null,
								postActionKo_ADD_TO_CRBT_BLACKLIST : null,
								postActionKo_RESUME_FROM_CRBT_BLACKLIST : null,
								postActionKo_DISACTIVATE_SERVICE : null
							};
							if (currentConnection.sourceState_Name != null
									&& currentConnection.done == false
									&& currentConnection.eventname == events_Name[e]) {
								console.log("*********currentConnection.sourceState_Name : "+currentConnection.sourceState_Name );
								actualState_Source = currentConnection.sourceState_Name;
								var y = jsPlumb.getDefaultScope();
								jsPlumb
										.select({
											scope : y
										})
										.each(

												function(connection) {

													if (connection.sourceState_Name == actualState_Source
															&& connection.done == false
															&& connection.eventname == currentConnection.eventname) {
														currentConnection.done = true;
														connection.done = true;
														transitionObject.sourceState = actualState_Source;
														console.log("*************connection.sourceState_Name:"+connection.sourceState_Name);
														if (currentConnection.connectionId != null) {
															transitionObject.id = currentConnection.connectionId;
														}
														if (currentConnection.doPreAction != null) {
															transitionObject.doPreAction = currentConnection.doPreAction;
														}

														// ////¨PostActionOK
														if (currentConnection.connectionFlag == "Ok") {
															if (currentConnection.targetState_Name != null) {
																transitionObject.targetStateOk = currentConnection.targetState_Name;
																console.log("****currentConnection.connectionFlag :"+currentConnection.connectionFlag);
															}

															if (currentConnection.postActionPackageName != null) {
																transitionObject.postActionOkPackageName = currentConnection.postActionPackageName;
							
															}
															if (currentConnection.postActionChargeMode != null) {
																transitionObject.postActionOkChargeMode = currentConnection.postActionChargeMode;
															}

															if (currentConnection.postActionProcessName != null) {
																transitionObject.postActionOkProcessName = currentConnection.postActionProcessName;
                                                            console.log("**************currentConnection.postActionProcessName"+currentConnection.postActionProcessName);
															}

															if (currentConnection.postActionDisactivate_SERVICE != null) {
																transitionObject.postActionOk_DISACTIVATE_SERVICE = currentConnection.postActionDisactivate_SERVICE;
																console
																		.log("***********************transitionObject.postActionOk_DISACTIVATE_SERVICE: "
																				+ transitionObject.postActionOk_DISACTIVATE_SERVICE);
																console.log("*******************currentConnection.postActionDisactivate_SERVICE :"+currentConnection.postActionDisactivate_SERVICE);
															}
															if (currentConnection.postActionAdd_TO_CRBT_BLACKLIST != null) {
																transitionObject.postActionOk_ADD_TO_CRBT_BLACKLIST = currentConnection.postActionAdd_TO_CRBT_BLACKLIST;

															}
															if (currentConnection.posActionResume_FROM_CRBT_BLACKLIST != null) {
																transitionObject.postActionOk_RESUME_FROM_CRBT_BLACKLIST = currentConnection.posActionResume_FROM_CRBT_BLACKLIST;

															}
															// ////¨PostActionko

															if (connection.connectionFlag == "Ko") {
																console.log("connection.connectionFlag : "+connection.connectionFlag );
																if (connection.targetState_Name != null) {
																	transitionObject.targetStateKo = connection.targetState_Name;
																}

																if (connection.postActionPackageName != null) {
																	transitionObject.postActionKoPackageName = connection.postActionPackageName;
																}
																if (connection.postActionChargeMode != null) {
																	transitionObject.postActionKoChargeMode = connection.postActionChargeMode;
																}

																if (connection.postActionProcessName != null) {
																	transitionObject.postActionKoProcessName = connection.postActionProcessName;
																	console.log("**********connection.postActionProcessName :"+connection.postActionProcessName);
																}

																if (connection.postActionDisactivate_SERVICE != null) {
																	transitionObject.postActionKo_DISACTIVATE_SERVICE = connection.postActionDisactivate_SERVICE;
																	console.log("************************currentConnection.postActionDisactivate_SERVICE:"+current.postActionDisactivate_SERVICE);
																}
																if (connection.postActionAdd_TO_CRBT_BLACKLIST != null) {
																	transitionObject.postActionKo_ADD_TO_CRBT_BLACKLIST = connection.postActionAdd_TO_CRBT_BLACKLIST;
																}
																if (connection.posActionResume_FROM_CRBT_BLACKLIST != null) {
																	transitionObject.postActionKo_RESUME_FROM_CRBT_BLACKLIST = connection.posActionResume_FROM_CRBT_BLACKLIST;
																}
															}

														}
														else if (currentConnection.connectionFlag == "Ko") {
															console.log("*************currentConnection.connectionFlag"+currentConnection.connectionFlag);
															if (currentConnection.targetState_Name != null) {
																transitionObject.targetStateKo = currentConnection.targetState_Name;
															}
															// PostActionKo
															if (currentConnection.postActionPackageName != null) {
																transitionObject.postActionKoPackageName = currentConnection.postActionPackageName;
															}
															if (currentConnection.postActionChargeMode != null) {
																transitionObject.postActionKoChargeMode = currentConnection.postActionChargeMode;
															}
															if (currentConnection.postActionProcessName != null) {
																transitionObject.postActionKoProcessName = currentConnection.postActionProcessName;
																console.log("currentConnection.postActionProcessName :"+currentConnection.postActionProcessName);
															}
															if (currentConnection.postActionDisactivate_SERVICE != null) {
																transitionObject.postActionKo_DISACTIVATE_SERVICE = currentConnection.postActionDisactivate_SERVICE;
																console.log("currentConnection.postActionDisactivate_SERVICE : "+currentConnection.postActionDisactivate_SERVICE );
															}
															if (currentConnection.postActionAdd_TO_CRBT_BLACKLIST != null) {
																transitionObject.postActionKo_ADD_TO_CRBT_BLACKLIST = currentConnection.postActionAdd_TO_CRBT_BLACKLIST;
															}
															if (currentConnection.posActionResume_FROM_CRBT_BLACKLIST != null) {
																transitionObject.postActionKo_RESUME_FROM_CRBT_BLACKLIST = currentConnection.posActionResume_FROM_CRBT_BLACKLIST;
															}
															// ////PostActionOk
															if (connection.connectionFlag == "Ok") {
																console.log("*********connection.connectionFlag "+connection.connectionFlag );
																if (connection.targetState_Name != null) {
																	transitionObject.targetStateOk = connection.targetState_Name;
																}

																if (connection.postActionPackageName != null) {
																	transitionObject.postActionOkPackageName = connection.postActionPackageName;
																}
																if (connection.postActionChargeMode != null) {
																	transitionObject.postActionOkChargeMode = connection.postActionChargeMode;
																}
																if (connection.postActionProcessName != null) {
																	transitionObject.postActionOkProcessName = postActionProcessName;
																	connsole.log("connection.postActionProcessName :"+connection.postActionProcessName );
																}
																if (connection.postActionDisactivate_SERVICE != null) {
																	transitionObject.postActionOk_DISACTIVATE_SERVICE = connection.postActionDisactivate_SERVICE;
																	console
																			.log("************************transitionObject.postActionOk_DISACTIVATE_SERVICE : "
																					+ transitionObject.postActionOk_DISACTIVATE_SERVICE);
																	
																}
																if (connection.postActionAdd_TO_CRBT_BLACKLIST != null) {
																	transitionObject.postActionOk_ADD_TO_CRBT_BLACKLIST = connection.postActionAdd_TO_CRBT_BLACKLIST;

																}
																if (connection.posActionResume_FROM_CRBT_BLACKLIST != null) {
																	transitionObject.postActionOk_RESUME_FROM_CRBT_BLACKLIST = connection.posActionResume_FROM_CRBT_BLACKLIST;

																}
															}
														}

														
														/** ** */
														var i=0;
														var find = false;
														while (find == false && i < eventObject.transition.length) {
														
															if (transitionObject.id ==  eventObject.transition[i].id) {
																
																find = true;
															}
															i++;
															console.log("SALUT");
														}
														if (find==false)
															{
															eventObject.transition
																	.push(transitionObject);				
													}
//														eventObject.transition
//																.push(transitionObject);

												
												
					                           /** ** */

													}

												});
								if (currentConnection.done == false) {
									currentConnection.done = true;
									transitionObject.sourceState = actualState_Source;
									if (currentConnection.connectionId != null) {
										transitionObject.id = currentConnection.connectionId;
									}
									if (currentConnection.doPreAction != null) {
										transitionObject.doPreAction = currentConnection.doPreAction;
									}
									if (currentConnection.connectionFlag == "Ok") {
										console.log("currentConnection.connectionFlag :"+currentConnection.connectionFlag);
										if (currentConnection.targetState_Name != null) {
											transitionObject.targetStateOk = currentConnection.targetState_Name;
										}
										// ///PostActionOk
										if (currentConnection.postActionPackageName != null) {
											transitionObject.postActionOkPackageName = currentConnection.postActionPackageName;
										}
										if (currentConnection.postActionChargeMode != null) {
											transitionObject.postActionOkChargeMode = currentConnection.postActionChargeMode;
										}
										if (connection.postActionProcessName != null) {
											transitionObject.postActionOkProcessName = postActionProcessName;
											console.log("******************connection.postActionProcessName:"+connection.postActionProcessName);
										}
										if (connection.postActionDisactivate_SERVICE!= null) {
											transitionObject.postActionOk_DISACTIVATE_SERVICE = connection.postActionDisactivate_SERVICE;
                                        console.log("************************transitionObject.postActionOk_DISACTIVATE_SERVICE  : "+ transitionObject.postActionOk_DISACTIVATE_SERVICE  );
                                        console.log("*****************connection.postActionDisactivate_SERVICE"+connection.postActionDisactivate_SERVICE);
										}
										if (connection.postActionAdd_TO_CRBT_BLACKLIST != null) {
											transitionObject.postActionOk_ADD_TO_CRBT_BLACKLIST  = connection.postActionAdd_TO_CRBT_BLACKLIST;

										}
										if (connection.posActionResume_FROM_CRBT_BLACKLIST != null) {
											transitionObject.postActionOk_RESUME_FROM_CRBT_BLACKLIST = connection.posActionResume_FROM_CRBT_BLACKLIST ;

										}

									} else if (currentConnection.connectionFlag == "Ko") {
										console.log("******************currentConnection.connectionFlag "+currentConnection.connectionFlag);
										if (currentConnection.targetState_Name != null) {
											transitionObject.targetStateKo = currentConnection.targetState_Name;
										}
										// PostActionko
										if (currentConnection.postActionPackageName != null) {
											transitionObject.postActionKoPackageName = currentConnection.postActionPackageName;
										}
										if (currentConnection.postActionChargeMode != null) {
											transitionObject.postActionKoChargeMode = currentConnection.postActionChargeMode;
										}
										if (currentConnection.postActionProcessName != null) {
											transitionObject.postActionKoProcessName = currentConnection.postActionPackageName;
											console.log("*******************currentConnection.postActionProcessName :"+currentConnection.postActionProcessName);
										}
										if (connection.postActionDisactivate_SERVICE != null) {
											transitionObject.postActionKo_DISACTIVATE_SERVICE = connection.postActionDisactivate_SERVICE;
											console.log("*****************currentConnection.postActionDisactivate_SERVICE"+currentConnection.postActionDisactivate_SERVICE);
										}
										if (connection.postActionAdd_TO_CRBT_BLACKLIST != null) {
											transitionObject.postActionKo_ADD_TO_CRBT_BLACKLIST = connection.postActionAdd_TO_CRBT_BLACKLIST;
										}
										if (connection.posActionResume_FROM_CRBT_BLACKLIST != null) {
											transitionObject.postActionKo_RESUME_FROM_CRBT_BLACKLIST = connection.posActionResume_FROM_CRBT_BLACKLIST;
										}
									}

									
									/** ** */
									var i=0;
									var find = false;
									while (find == false && i < eventObject.transition.length) {
									
										if (transitionObject.id ==  eventObject.transition[i].id) {
											
											find = true;
										}
										i++;
										console.log("SALUT");
									}
									if (find==false)
										{
										eventObject.transition
												.push(transitionObject);				
								}
//									eventObject.transition
//											.push(transitionObject);
								}
							}

						});

		lifeCycleUpdated.transitions.event.push(eventObject);
	}

	lifeCycleUpdated.jsonObject=JSON.stringify(lifeCycleUpdated);

	console.log("JSONOBJECT"+JSON.stringify(lifeCycleUpdated));
	$
			.ajax({
				beforeSend : function(xhrObj) {
					xhrObj.setRequestHeader("Content-Type", "application/json");

				},
				type : "POST",
				url : "http://localhost:9090/lcm-admin/lcmMvc/controllerJSONDeploy/deployLifeCycle",
				// processData: false,
				data : JSON.stringify(lifeCycleUpdated),
				dataType : "json",
				success : function(data, textStatus, jqXHR) {
					alert('	SUCCES MODIFICATION !');
				},
				error : function(jqXHR, textStatus, errorThrown) {
					alert("error:  status:  " + textStatus + " er: "
							+ errorThrown);
				},
				done : function(data, textStatus, jqXHR) {
					alert('done....');
				}
			});
}

/*
 * Set Colors
 */

function getStateColor(stateName) {
	for ( var i = 0; i < stateColors.length; i++) {
		if (stateColors[i].name == stateName) {
			return stateColors[i].color;
		}
	}
}

function initStateColors() {
	var activeStateObject = new Object();
	activeStateObject.name = "INITIALE";
	activeStateObject.color = "rgb(228, 219, 219)";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "ACTIVE";
	activeStateObject.color = "#00FF00";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "SMS_EXPIRATION";
	activeStateObject.color = "#FFFF00";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "GRACE";
	activeStateObject.color = "#DF3A01";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "SMS_EXPIRATION_1";
	activeStateObject.color = "#BC6FB9";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "SMS_EXPIRATION_2";
	activeStateObject.color = "#BC6FB9";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "SMS_EXPIRATION_3";
	activeStateObject.color = "#BC6FB9";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "RAPPEL";
	activeStateObject.color = "#BC6FB9";
	stateColors.push(activeStateObject);

	activeStateObject = new Object();
	activeStateObject.name = "FINALE";
	activeStateObject.color = "#F80000";
	stateColors.push(activeStateObject);
}
