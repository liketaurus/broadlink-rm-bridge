       var bridgeHost;
        var bridgePath = "/";
        
        function init() { 
            var app = angular.module("app", [])
                .controller("RMController", function ($scope, $http) {
                    
                    if(typeof(Storage) !== "undefined") {
                        var bh = localStorage.getItem("bridgeHost");
                        if(bh != undefined && bh.indexOf(":") != -1) {
                            $scope.bridge_ip = bh.split(":")[0];
                            $scope.bridge_port = bh.split(":")[1];
                        }
                    }
                    
                    $scope.devices = {
                        list: [  
                        ]
                    };



                    $scope.device = undefined;
                    $scope.code = undefined;
                    $scope.shortcut_url = undefined;
                    $scope.error_message = undefined;
                    $scope.working = false;
             
                    $scope.setBridgeHost = function() {
                        bridgeHost = $scope.bridge_ip + ':' + $scope.bridge_port;
                        
                        if(typeof(Storage) !== "undefined") {
                            localStorage.setItem("bridgeHost", bridgeHost);
                        }
                    };
                    
                    $scope.callApi = function(cmd, success, error) {
                        $scope.error_message = undefined;
                        $scope.working = true;
                        $http.jsonp('http://' + bridgeHost + bridgePath + '?cmd=' + encodeURI(JSON.stringify(cmd)) + '&callback=JSON_CALLBACK' ).
                            success(success).
                            error(error);
                    };
                    
                    $scope.error = function(data, status, headers, config) {
                        $scope.working = false;
                        $scope.error_message = "ERROR: HTTP/" + status;
                    };
                
                    $scope.loadDevices = function() {
                        $scope.callApi({api_id: 1000, command: "registered_devices"}, 
                            function(data, status, headers, config) {
                                $scope.working = false;
                                if(data.code == 0) {
                                    // Only keep RM1 or RM2 devices
                                    for(var i=0; i<data.list.length; i++) {
                                        var type = data.list[i].type;
                                        
                                        if(type != "RM1" && type !="RM2") {
                                            data.list.splice(i, 1);
                                        }
                                    }
                                    
                                    data.list.sort(function(a, b){return a.name.localeCompare(b.name);});

                                     $scope.devices = data;
                                    if(data.list.length > 0) {
                                        $scope.device = data.list[0];
                                    }
                                }
                                else {
                                    $scope.error_message = "Error retrieving devices: " + data.msg;
                                }
                            },
                            $scope.error);
                    };
                    
                    $scope.reLoadDevices = function() {
                        $scope.callApi({api_id: 1001, command: "probe_devices"},
                            function(data, status, headers, config) {
                                $scope.working = false;
                                if(data.code == 0) {
                                    $scope.loadDevices();
                                }
                                else {
                                    $scope.error_message = "Error probing devices: " + data.msg;
                                }
                            },
                            $scope.error);
                    };
                    
                    
                    $scope.learnCode = function() {
                        $scope.code = undefined;
                        $scope.shortcut_url = undefined;
                        $scope.shortcut_name = $scope.code_name;
                        
                        $scope.callApi({api_id: 1002, command: "learn_code", mac: $scope.device.mac},
                            function(data, status, headers, config) {
                                if(data.code == 0) {
                                    setTimeout($scope.getCode, 5000);
                                }
                                else {
                                   $scope.error_message = "Error learning code: " + data.msg; 
                                }
                            },
                            $scope.error);
                    };
                    
                     $scope.getCode = function() {
                        $scope.callApi($scope.shortcut_name != undefined &&$scope.shortcut_name.length > 0 ? {api_id: 1003, command: "get_code", mac: $scope.device.mac, name: $scope.shortcut_name} : {api_id: 1003, command: "get_code", mac: $scope.device.mac},
                            function(data, status, headers, config) {
                                $scope.working = false;
                                if(data.code == 0) {
                                    if($scope.shortcut_name != undefined &&$scope.shortcut_name.length > 0) {
                                        $scope.shortcut_url = 'http://' + bridgeHost + "/code/" + encodeURI($scope.shortcut_name);
}
                                    
									$scope.command_plain = JSON.stringify({api_id: 1004, command: "send_code", mac: $scope.device.mac, data: data.data});
                                    $scope.command_url = 'http://' + bridgeHost + bridgePath + '?cmd=' + encodeURI($scope.command_plain);
                                   $scope.code_test = $scope.command_url;
                                   $scope.code = data.data;
                                }
                                else {
                                    $scope.error_message = "Error sending code: " + data.msg;
                                }
                            },
                            $scope.error);
                    };

                });
        }
    
