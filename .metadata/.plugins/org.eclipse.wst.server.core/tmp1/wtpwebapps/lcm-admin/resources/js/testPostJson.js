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
			period.innerHTML = "Period= " + mSignal + M + "M " + dSignal + D
					+ "D " + hSignal + H + "H";
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

// /////////////////// initTransitionParameters(xhr, status,
// args)//////////////////////////
function initTransitionParameters(xhr, status, args) {
	if (args.validationFailed) {
		alert("Validation Failed");
	} else {
		console.debug("hide dialog call");
		init = function(conn) {
			conn.getOverlay("label").setLabel(
					args.transitionParameters.eventName);
			transitionId++;
			conn.connectionId = transitionId;
			conn.eventname = args.transitionParameters.eventName;
			conn.doPreAction = args.transitionParameters.doPreAction;
			// conn.connectionFlag = args.transitionParameters.transitionFlag;
			if (conn.doPreAction == "true") {
				conn.connectionFlag = args.transitionParameters.transitionFlag;
			} else {
				conn.connectionFlag = "Ok";
			}

			conn.sourceState_Name = document.getElementById(transitionSource).firstChild.innerHTML;
			conn.targetState_Name = document.getElementById(transitionTarget).firstChild.innerHTML;
			conn.done = false;
			conn.postAction = args.transitionParameters.postAction;
			console.log(conn.postAction);
			if (args.transitionParameters.postAction == 1) {
				conn.postActionPackageName = args.transitionParameters.packageName;
				conn.postActionChargeMode = args.transitionParameters.chargeMode;
			}
			console.log(args.transitionParameters.packageName);
			console.log(args.transitionParameters.chargeMode);
			if (args.transitionParameters.postAction == 2) {
				conn.postActionProcessName = args.transitionParameters.processName;
			}
			console.log(args.transitionParameters.processName);
			if (args.transitionParameters.postAction == 3) {
				conn.postActionWSUrl = args.transitionParameters.webServiceUrl;
				conn.postActionWSLogin = args.transitionParameters.webServiceLogin;
				conn.postActionWSPassword = args.transitionParameters.webServicePassword;
			}

		};
		jsPlumb.bind("connection", function(connInfo, originalEvent) {
			init(connInfo.connection);
		});
		jsPlumb.connect({
			source : transitionSource,
			target : transitionTarget
		});
		transitionInitDlg.hide();
	}
	transitionSource = null;
	transitionTarget = null;
}

// ////////////////showTransitionEditDialog///////////////////////////
function showTransitionEditDialog(connection) {
	clickedTransitionRemoteCmd([ {
		name : "clickedTransitionParameters",
		value : clickedState.name + ',' + clickedState.period + ','
				+ clickedState.rechargeDetector + '#' + clickedState.realStatus
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
			transitionId++;
			conn.connectionId = transitionId;
			conn.connectionFlag = args.transitionParameters.transitionFlag;
			conn.doPreAction = args.transitionParameters.doPreAction;
			conn.postAction = args.transitionParameters.postAction;
			conn.done = false;
			transitionInitDlg.hide();
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
						lastStateId = lifecycle.states.lastStateId;
						console.log("StatesJSON :LastStateID" + lastStateId);
						currentSncode = lifecycle.sncode;
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
						// var targetState = null;
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

													/** ********************** */

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
		name : null
	};

	var state = {
		stateParam : [],
		stateName : null,
		stateId : 0,
		periodState : null
	};

	var stateParam = {
		parameter : null,
		value : null
	};

	var event = {
		transition : [],
		name : null
	};

	var transition = {
		doPreaction : null,
		sourceState : null,
		targetStateOK : null,
		targetStateKo : null,
		postActionOk : null,
		postActionKo : null,
		id : 0,
		postActionOKProcessName : null,
		postActionOKPackageName : null,
		postActionOKChargeMode : null,
		postActionOKWebServiceURL : null,
		postActionOkWebServiceLogin : null,
		postActionOkWebServicePassword : null,
		postActionKoProcessName : null,
		postActionKoPackageName : null,
		postActionKoChargeMode : null,
		postActionKoWebServiceUrl : null,
		postActionKoWebServiceLogin : null,
		postActionKoWebServicePassword : null
	};

	if (variable > -1) {
		for ( var k = 0; k < transitionsToDelete.length; k++) {
			deletedTransitions = deletedTransitions + transitionsToDelete[k]
					+ "#";
		}
	}
	lifeCycleUpdated.sncode = currentSncode.toString();
	for ( var j = 4; j < stateMap.length; j++) {
		if (stateMap[j].name != null) {
			var stateNamemodel = stateMap[j].name;
			var stateIDmodel = j;
			stateParam.push("PERIOD", stateMap[j].period);
			stateParam.push("IF_RECHARGE_DETECTOR",
					stateMap[j].rechargeDetector);
			stateParam.push("REAL_SERIVCE_STATUS", stateMap[j].realStatus);
			state.stateParam.push(stateParam);
			state.stateId = stateIDmodel;
			state.stateName = stateNamemodel;
			lifeCycleUpdated.states.state.push(state);

		}
	}
	lifeCycleUpdated.transitions.deletedTransitions = deletedTransitions;
	for ( var e = 0; e < events_Name.length; e++) {
		event.name = events_Name[e];
		var x = jsPlumb.getDefaultScope();
		jsPlumb
				.select({
					scope : x
				})
				.each(
						function(currentConnection) {
							if (currentConnection.sourceState_Name != null
									&& currentConnection.done == false
									&& currentConnection.eventname == events_Name[e]) {
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
														transition.sourceState = actualState_Source;
														if (currentConnection.connectionId != null) {
															transition.id = currentConnection.connectionId;
														}
														if (currentConnection.doPreAction != null) {
															transition.doPreaction = currentConnection.doPreAction;
														}
														if (currentConnection.connectionFlag == "Ok") {
															if (currentConnection.targetState_Name != null) {
																transition.targetStateOK = currentConnection.targetState_Name;
															}
															if (currentConnection.postAction != null) {
																transition.postActionOk = currentConnection.postAction;
																if (currentConnection.postAction == "1") {
																	if (currentConnection.postActionPackageName != null) {
																		transition.postActionOKPackageName = currentConnection.postActionPackageName;
																	}
																	if (currentConnection.postActionChargeMode != null) {
																		transition.postActionOKChargeMode = currentConnection.postActionChargeMode;
																	}
																} else if (currentConnection.postAction == "2") {
																	if (currentConnection.postActionProcessName != null) {
																		transition.postActionOKProcessName = currentConnection.postActionProcessName;
																	}
																} else if (currentConnection.postAction == "3") {
																	if (currentConnection.postActionWSUrl != null) {
																		transition.postActionOKWebServiceURL = currentConnection.postActionWSUrl;
																	}
																	if (currentConnection.postActionWSLogin != null) {

																		transition.postActionOkWebServiceLogin = currentConnection.postActionWSLogin;
																	}
																	if (currentConnection.postActionWSPassword != null) {
																		transition.postActionOkWebServicePassword = currentConnection.postActionWSPassword;
																	}
																}
															}
															if (connection.connectionFlag == "Ko") {
																if (connection.targetState_Name != null) {
																	transition.targetStateKo = connection.targetState_Name;
																}
																if (connection.postAction != null) {
																	transition.postActionKo = connection.postAction;
																	if (connection.postAction == "1") {
																		if (connection.postActionPackageName != null) {
																			transition.postActionKoPackageName = connection.postActionPackageName;
																		}
																		if (connection.postActionChargeMode != null) {
																			transition.postActionKoChargeMode = connection.postActionChargeMode;
																		}
																	} else if (connection.postAction == "2") {
																		if (connection.postActionProcessName != null) {
																			transition.postActionKoProcessName = connection.postActionProcessName;
																		}
																	} else if (connection.postAction == "3") {
																		if (connection.postActionWSUrl != null) {
																			transition.postActionKoWebServiceURL = connection.postActionWSUrl;
																		}
																		if (connection.postActionWSLogin != null) {
																			transition.postActionKoWebServiceLogin = connection.postActionWSLogin;
																		}
																		if (connection.postActionWSPassword != null) {
																			transition.postActionKoWebServicePassword = connection.postActionWSPassword;
																		}
																	}
																}
															}
														} else if (currentConnection.connectionFlag == "Ko") {
															if (currentConnection.targetState_Name != null) {
																transition.targetStateKo = currentConnection.targetState_Name;
															}
															if (currentConnection.postAction != null) {
																transition.postActionKo = currentConnection.postAction;
																if (currentConnection.postAction == "1") {
																	if (currentConnection.postActionPackageName != null) {
																		transition.postActionKoPackageName = currentConnection.postActionPackageName;
																	}
																	if (currentConnection.postActionChargeMode != null) {
																		transition.postActionKoChargeMode = currentConnection.postActionChargeMode;
																	}
																} else if (currentConnection.postAction == "2") {
																	if (currentConnection.postActionProcessName != null) {
																		transition.postActionKoProcessName = currentConnection.postActionProcessName;
																	}
																} else if (currentConnection.postAction == "3") {
																	if (currentConnection.postActionWSUrl != null) {
																		transition.postActionKoWebServiceURL = currentConnection.postActionWSUrl;
																	}
																	if (currentConnection.postActionWSLogin != null) {
																		transition.postActionKoWebServiceLogin = currentConnection.postActionWSLogin;
																	}
																	if (currentConnection.postActionWSPassword != null) {
																		transition.postActionKoWebServicePassword = currentConnection.postActionWSPassword;
																	}
																}
															}
															if (connection.connectionFlag == "Ok") {
																if (connection.targetState_Name != null) {
																	transition.targetStateOK = connection.targetState_Name;
																}
																if (connection.postAction != null) {
																	transition.postActionOk = connection.postAction;
																	if (connection.postAction == "1") {
																		if (connection.postActionPackageName != null) {
																			transition.postActionOKPackageName = connection.postActionPackageName;
																		}
																		if (connection.postActionChargeMode != null) {
																			transition.postActionOKChargeMode = connection.postActionChargeMode;
																		}
																	} else if (connection.postAction == "2") {
																		if (connection.postActionProcessName != null) {
																			transition.postActionOKProcessName = postActionProcessName;
																		}
																	} else if (connection.postAction == "3") {
																		if (connection.postActionWSUrl != null) {
																			transition.postActionOKWebServiceURL = connection.postActionWSUrl;
																		}
																		if (connection.postActionWSLogin != null) {
																			transition.postActionOkWebServiceLogin = connection.postActionWSLogin;
																		}
																		if (connection.postActionWSPassword != null) {
																			transition.postActionOkWebServicePassword = connection.postActionWSPassword;
																		}
																	}
																}
															}
														}
														event.transition
																.push(transition);

													}
												});
								if (currentConnection.done == false) {
									currentConnection.done = true;
									transition.sourceState = actualState_Source;
									if (currentConnection.connectionId != null) {
										transition.id = currentConnection.connectionId;
									}
									if (currentConnection.doPreAction != null) {
										transition.doPreaction = currentConnection.doPreAction;
									}
									if (currentConnection.connectionFlag == "Ok") {
										if (currentConnection.targetState_Name != null) {
											transition.targetStateOK = currentConnection.targetState_Name;
										}
										if (currentConnection.postAction != null) {
											transition.postActionOk = currentConnection.postAction;
											if (currentConnection.postAction == "1") {
												if (currentConnection.postActionPackageName != null) {
													transition.postActionOKPackageName = currentConnection.postActionPackageName;
												}
												if (currentConnection.postActionChargeMode != null) {
													transition.postActionOKChargeMode = currentConnection.postActionChargeMode;
												}
											} else if (currentConnection.postAction == "2") {
												if (currentConnection.postActionPackageName != null) {
													transition.postActionOKPackageName = currentConnection.postActionPackageName;
												}
											} else if (currentConnection.postAction == "3") {
												if (currentConnection.postActionWSUrl != null) {
													transition.postActionOKWebServiceURL = currentConnection.postActionWSUrl;
												}
												if (currentConnection.postActionWSLogin != null) {
													transition.postActionOkWebServiceLogin = currentConnection.postActionWSLogin;
												}
												if (currentConnection.postActionWSPassword != null) {
													transition.postActionOkWebServicePassword = currentConnection.postActionWSPassword;
												}
											}
										}
									} else if (currentConnection.connectionFlag == "Ko") {
										if (currentConnection.targetState_Name != null) {
											transition.targetStateKo = currentConnection.targetState_Name;
										}
										if (currentConnection.postAction != null) {
											transition.postActionKo = currentConnection.postAction;
											;
											if (currentConnection.postAction == "1") {
												if (currentConnection.postActionPackageName != null) {
													transition.postActionKoPackageName = currentConnection.postActionPackageName;
												}
												if (currentConnection.postActionChargeMode != null) {
													transition.postActionKoChargeMode = currentConnection.postActionChargeMode;
												}
											} else if (currentConnection.postAction == "2") {
												if (currentConnection.postActionPackageName != null) {
													transition.postActionKoProcessName = currentConnection.postActionPackageName;
												}
											} else if (currentConnection.postAction == "3") {
												if (currentConnection.postActionWSUrl != null) {
													transition.postActionKoWebServiceURL = currentConnection.postActionWSUrl;
												}
												if (currentConnection.postActionWSLogin != null) {
													transition.postActionKoWebServiceLogin = currentConnection.postActionWSLogin;
												}
												if (currentConnection.postActionWSPassword != null) {
													transition.postActionKoWebServicePassword = currentConnection.postActionWSPassword;
												}
											}
										}
									}
									event.transition.push(transition);
								}
							}
						});
		lifeCycleUpdated.transitions.event = event;
	}

	
//POST REQUEST
	jQuery.ajax({
				type : 'POST',
				contentType : 'application/json',
				url : "http://localhost:9090/lcm-admin/controllerJSONDeploy/deployLifeCycle",
				dataType : "json",
				data : JSON.stringify(lifeCycleUpdated),
				success : function(data, textStatus, jqXHR) {
					alert('ok........data' + data);
				},
				error : function(jqXHR, textStatus, errorThrown) {
					alert("error:  status:  " + textStatus + " er: " + errorThrown);
				}, 
				done : function(data, textStatus, jqXHR){
					alert('done....data' + data);
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

