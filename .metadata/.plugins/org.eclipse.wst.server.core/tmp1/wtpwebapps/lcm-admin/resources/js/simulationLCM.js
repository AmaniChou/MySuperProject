//Variables//
var actualState_Id = 0;
var variable = -1;
var sourceState_Name = "";
var targetState_Name = "";
var stateMap = new Array();
var MAP_Connect = new Array();
var events_Name = [ "ACTIVATION", "DESACTIVATION", "DATE_ATTEINTE",
		"RECHARGE_DETECTOR", "PRELEVEMENT" ];
var save = false;
var actualState_Source = "";
var currentSncode = null;
var transitionsToDelete = new Array();
var clickedStateId = 0;
var transitionSource = 0;
var transitionTarget = 0;
var clickedEndPoint = 0;
var lifecycle;
var lastStateId;
var lastTransitionId;
var transitions = [];
var message;
var contentMessage;
var msgContent1;
var msgContent2;
var msgContent3;
var stateColors = [];
var dateBeginSimulation;
var dateEndSimulation;
var dateRecharge;
var end;
var endStateId;
var sourceStateId;
var id_begin_state;

// Paramèters par défaut//
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
$(document).ready(function() {
	$('#butid').click(function() {
		saveLifeCycle();
	});
});

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

// Fonction remove
var removeFromStatesList = "";
function showStateDialog(lastStateId) {
	console.debug("show dialog init State call");
	clickedStateId = lastStateId;
	stateInitDlg.show();
}

var stateId = 3;
// Appel au controleur pour retourner le mod_èle JSON//
function serviceCycle() {
	initStateColors();
	$
			.getJSON(
					"http://localhost:9090/lcm-admin/lcmMvc/controllerJSONSimulation/getJSONSimul",
					function(data) {
						lifecycle = data;
						dateBeginSimulation = lifecycle.dateBeginSimulation;
						dateEndSimulation = lifecycle.dateEndSimulation;
						dateRecharge = lifecycle.dateRecharge;
						console
								.log("dateBeginSimulation"
										+ dateBeginSimulation);
						console.log("dateEndSimulation" + dateEndSimulation);
						console.log("dateRecharge" + dateRecharge);
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
											if (confirm("Vous désirez supprimer cette transition entre "
													+ conn.sourceState_Name
													+ " et "
													+ conn.targetState_Name
													+ "?"))
												jsPlumb.detach(conn);
											if (conn.connectionId < transitionId) {
												d++;
												transitionsToDelete[d] = conn.connectionId;

											}
										});

						// //////////////////////////StatesJSON//////////////////////////////
						lastStateId = lifecycle.states.laststateId;
						currentSncode = lifecycle.sncode;
						var stateList = lifecycle.states.state;
						var top = 400;
						var left = 500;
						var bool = 0;
						var chart = document.getElementById('lifeCycleChart');
						var beginMessage = document.createElement('div');
						beginMessage.setAttribute('id', 'a');
						var globalMsg = document.createElement('div');
						globalMsg.setAttribute('id', 'b');
						chart.appendChild(beginMessage);
						beginMessage.appendChild(globalMsg);
						globalMsg.setAttribute('class', 'effect');
						m1 = document.createElement('h2');
						m1.innerHTML = "Start Simulation";
						m2 = document.createElement('h3');
						m2.innerHTML = "Date Begin Simulation:  "
								+ dateBeginSimulation;
						m3 = document.createElement('h3');
						m1.setAttribute('id', 'c');
						m2.setAttribute('id', 'd');
						m3.setAttribute('id', 'e');
						globalMsg.appendChild(m1);
						globalMsg.appendChild(m2);
						globalMsg.appendChild(m3);
						beginMessage.style.left = left - 300;
						beginMessage.style.position = "absolute";
						beginMessage.top = top - 100;
						stateList
								.forEach(function(entry) {
									var paramList = new Array();
									paramList = entry.stateParam;
									var state_name = entry.stateName;
									var stateId = entry.stateId;
									var state = document.createElement('div');
									message = document.createElement('div');
									contentMessage = document
											.createElement('div');
									state.setAttribute('id', stateId);
									message.setAttribute('id', 'a' + stateId);
									message.setAttribute('id', 'a' + stateId);
									contentMessage.setAttribute('id', 'aa'
											+ stateId);
									msgContent1 = document.createElement('h2');
									msgContent2 = document.createElement('h3');
									msgContent3 = document.createElement('h3');
									msgContent2.setAttribute('id', 'aaa'
											+ stateId);
									msgContent3.setAttribute('id', 'aaaa'
											+ stateId);
									msgContent1.innerHTML = "Actual State: "
											+ state_name;
									message.appendChild(contentMessage);
									contentMessage.appendChild(msgContent1);
									contentMessage.appendChild(msgContent2);
									contentMessage.appendChild(msgContent3);
									state.setAttribute('class', 'state');
									message.setAttribute('class', 'msg');
									contentMessage.setAttribute('class',
											'effect');
									state.setAttribute('ondblclick',
											'showEditStateDialog(' + stateId
													+ ')');
									state.style.left = left;
									state.style.top = top;
									chart.appendChild(state);
									message.style.left = left + 181;
									message.style.position = "absolute";
									message.style.top = top;
									chart.appendChild(message);
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
									// period.style.fontWeight = 'bold';
									period.innerHTML = "P= " + state_period;
									state.appendChild(period);
									var sourcePoint = document
											.createElement('div');
									// Hide State
									$("#" + stateId)
											.css("visibility", "hidden");
									// Hide message
									$("#" + 'a' + stateId).css("visibility",
											"hidden");

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

						// /////////////////////EventsJSON//////////////////////////////
						console
								.log("*************getEventsJSON()******************");
						lastTransitionId = lifecycle.transitions.lastTransitionId;
						console.log(" La derniere transition id : "
								+ lastTransitionId);
						var eventList = lifecycle.transitions.event;
						var event_name = null;
						var id = null;
						var doPreAction = null;
						// var targetState = null;
						var postAction = null;
						var target_state_ok = null;
						var target_state_ko = null;
						var i = 1;
						eventList
								.forEach(function(entry) {

									event_name = entry.name;

									var transitionList = entry.transition;
									transitionList
											.forEach(function(entry2) {
												var entryDate = entry2.entryDate;
												console.log("Entry Date: "
														+ entryDate);
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

													/** ********************** */

													console
															.log(" target_state_id_Ok : "
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

														};
														jsPlumb
																.bind(
																		"connection",
																		function(
																				connInfo,
																				originalEvent) {
																			init(connInfo.connection);
																		});
														var source_str = "";
														source_str = source_state_id
																.toString();

														var target_str = target_state_id
																.toString();

														// jsPlumb
														// .connect({
														// source : source_str,
														// target : target_str,
														//																		
														// });
														/** ********************* */
														console
																.log("Préaction push: "
																		+ doPreAction);
														transitions
																.push({
																	sourceState : source_str,
																	targetState : target_str,
																	eventName : event_name,
																	postAction : postAction,
																	sourceStateName : source_state,
																	targetStateName : target_state_ok,
																	// postActionko:
																	// "",
																	doPreaction : doPreAction,
																	datedBeginSimulation : dateBeginSimulation,
																	dateEndSimulation : dateEndSimulation,
																	dateRecharge : dateRecharge,
																	entryDate : entryDate
																});
														/** ***************************** */

													}
													i = i + 1;
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
															entryDate: entryDate

														};
														jsPlumb
																.bind(
																		"connection",
																		function(
																				connInfo,
																				originalEvent) {
																			init(connInfo.connection);
																		});
														var source_str = "";
														source_str = source_state_id
																.toString();
														var target_str = target_state_Ko_ID
																.toString();

														/** ********************* */
														transitions
																.push({
																	sourceState : source_str,
																	targetState : target_str,
																	eventName : event_name,
																	sourceStateName : source_state,
																	targetStateName : target_state_ko,
																	// postActionOk:
																	// "",
																	postAction : postAction,
																	doPreaction : doPreAction,
																	datedBeginSimulation : dateBeginSimulation,
																	dateEndSimulation : dateEndSimulation,
																	dateRecharge : dateRecharge,
																	entryDate : entryDate
																});
														/** ***************************** */

														// jsPlumb
														// .connect({
														// source : source_str,
														// target : target_str,
														//																	
														// });
													}
													i = i + 1;
													id = null;
													doPreAction = null;
													targetState = null;
													postAction = null;
												}

											});

									event_name = null;
								});

						 //get ID initial
						 /** *********************** */
						 var stateList = lifecycle.states.state;
						 var find = false;
						 stateList
						 .forEach(function(entry) {
						 state_name = entry.stateName;
						 if (state_name == "INITIALE") {
						 stateId = entry.stateId;
						 find = true;
						 }
						 });
						 if (find)
						 id_begin_state = stateId;
						 else
						 id_begin_state = 0;
						setTimeout(function() {
							// Show pop up msg
							$("#" + 'b').css("visibility", "visible");
							var idmsg = 'c';
							runEffect(idmsg, 'blind');
						}, 1000);
						setTimeout(function() {
							$("#" + 'b').css("visibility", "hidden");
						}, 4000);
						// set connection
						connection();
					    setCSS(id_begin_state);
						// if (end =="true")
						// {
						// setTimeout(function() {
						// //Show pop up msg
						// $("#" + 'b')
						// .css("visibility", "visible");
						// var idmsg='c';
						// runEffect(idmsg,'blind');
						// },1000);
						// setTimeout(function() {$("#" + 'b').css("visibility",
						// "hidden");
						// },4000);
						// }
						/** **Message de sin */
						// $("#" + 'c').empty;
						// document.getElementById("#"+'c').innerHTML ="FIN
						// SIMULATION !";
						// setTimeout(function() {
						// //Show pop up msg
						// $("#" + 'b')
						// .css("visibility", "visible");
						// var idmsg='c';
						// runEffect(idmsg,'blind');
						// },1000);
						// setTimeout(function() {$("#" +'b').css("visibility",
						// "hidden");
						// },6000);
						// attribuer une classe au dernier état
					});
	
}

/*
 * set CSS Class
 */

function setCSS(eleID) {
	//var currElemt = document.getElementById(eleID);
	$("#"+eleID).addClass("shadow");
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
	activeStateObject.name = "FINALE";
	activeStateObject.color = "#F80000";
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
}

/*
 * Function connect States
 */
var z = 0;
function connectStates(srcState, targetState, eventName, entryDate) {
	console.log("Source state =" + srcState + " target State " + targetState
			+ " event name =" + eventName);
	endStateId = targetState;
	sourceStateId = srcState;
	console.log("endStateId: " + endStateId);
	jsPlumb.connect({
		source : srcState,
		target : targetState,
		overlays : [
				[
						"Label",
						{
							label : "&nbsp;" + "&nbsp;" + "&nbsp;" + "&nbsp;"
									+ "&nbsp;" + "&nbsp;" + eventName + "<br/>"
									+ entryDate,
							id : 'label',
							cssClass : 'alabel',
							location : 0.4 * z
						} ], ],

		dragOptions : {
			cursor : 'crosshair'
		},

	});
	z = z + 0.5;
}

/*
 * Function effect
 */
function runEffect(idmsg, effect) {
	// get effect type from
	var selectedEffect = effect;
	// most effect types need no options passed by default
	var options = {};
	// some effects have required parameters
	if (selectedEffect === "scale") {
		options = {
			percent : 100
		};
	} else if (selectedEffect === "size") {
		options = {
			to : {
				width : 280,
				height : 185
			}
		};
	}
	var id = "#" + idmsg;
	// run the effect
	$("#" + idmsg).show(selectedEffect, options, 500, callback(id));
};
// callback function to bring a hidden box back
function callback(id) {
	setTimeout(function() {
		$("id:visible").removeAttr("style").fadeOut();
	}, 1000);
};

/*
 * Set Connections
 */
function connection() {
	var i = 1;
	$
			.each(
					transitions,
					function(outerKey, outerValue) {
						var postAction = outerValue.postAction;
						var preaction = outerValue.doPreaction;
						// var postActionko=outerValue.postActionKo;
						var dateBeginSimulation = outerValue.datedBeginSimulation;
						var dateEndSimulation = outerValue.dateEndSimulation;
						var dateRecharge = outerValue.dateRecharge;
						var sourceStateName = outerValue.sourceStateName;
						var targetStateName = outerValue.targetStateName;

						// console.log("postActionOK: "+postActionOK);
						console.log("preaction: " + preaction);
						console.log("postAction: " + postAction);
						console.log("dateBeginSimulation: "
								+ dateBeginSimulation);
						console.log("dateEndSimulation: " + dateEndSimulation);
						console.log("dateRecharge: " + dateRecharge);
						console.log("sourceStateName: " + sourceStateName);
						console.log("targetStateName: " + targetStateName);
                        //affecter les pre-actions et les post-actions
						if (preaction.toString() == "true") {
							document.getElementById('aaa'
									+ outerValue.sourceState).innerHTML = " There is a preAction ";
						}
						if (preaction.toString() == "false") {
							document.getElementById('aaa'
									+ outerValue.sourceState).innerHTML = " There is not a preAction ";
						}
						if (postAction != null) {
							document.getElementById('aaaa'
									+ outerValue.targetState).innerHTML = " There is a postAction ";
						} else {
							document.getElementById('aaaa'
									+ outerValue.targetState).innerHTML = " There is not a postAction ";
						}

						// show sourceState
						setTimeout(function() {
							$("#" + outerValue.sourceState).css("visibility",
									"visible");
							// Show pop up msg
							$("#" + 'a' + outerValue.sourceState).css(
									"visibility", "visible");
							var idmsg = 'aa' + outerValue.sourceState;
							runEffect(idmsg, 'slide');
						}, i * 2500);
						i++;
						setTimeout(function() {
							$("#" + 'a' + outerValue.sourceState).css(
									"visibility", "hidden");
							connectStates(outerValue.sourceState,
									outerValue.targetState,
									outerValue.eventName, outerValue.entryDate)
						}, i * 2500);
						i++;
						setTimeout(function() {
							setCSS(endStateId);
							console.log("ID " +endStateId);
							console.log("prev ID" + sourceStateId.toString());
							$("#"+ sourceStateId.toString()).removeClass("shadow");
						}, i * 2500);
						// Show Final TargetState
//						if (outerValue.targetStateName == "FINALE") {
							setTimeout(function() {
								$("#" + outerValue.targetState).css(
										"visibility", "visible");
								// Show pop up msg
//								$("#" + 'a' + outerValue.targetState).css(
//										"visibility", "visible");
//								var idmsg = 'aa' + outerValue.targetState;
//								runEffect(idmsg, 'slide');
							}, i * 2500);
							setTimeout(function() {
								setCSS(endStateId);
							}, i * 2500);
							setTimeout(function() {
								$("#" + 'a' + outerValue.targetState).css(
										"visibility", "hidden");
							}, i * 3000);
							// i = i+1;
					//	}
					});

}

window.onload = serviceCycle;
