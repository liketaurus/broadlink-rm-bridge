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
                    
                    $scope.codes = [];
                    $scope.device = undefined;
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
                
                    $scope.addCodes = function() {
                        $scope.callApi({api_id: 1007, command: "add_codes", list: JSON.parse($scope.codes_json)}, 
                            function(data, status, headers, config) {
                                $scope.working = false;
                                if(data.code == 0) {
                                    
                                    data.list.sort(function(a, b){return a.name.localeCompare(b.name);});

                                    
                                }
                                else {
                                    $scope.error_message = "Error retrieving codes: " + data.msg;
                                }
                            },
                            $scope.error);
                    };
 

                });
        }