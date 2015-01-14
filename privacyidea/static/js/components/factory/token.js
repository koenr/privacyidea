/**
 * http://www.privacyidea.org
 * (c) cornelius kölbel, cornelius@privacyidea.org
 *
 * 2015-01-11 Cornelius Kölbel, <cornelius@privacyidea.org>
 *
 * This code is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
function fixUser(user) {
    console.log("User In: " + user);
    if (user) {
        var stripUser = user.match(/^\[.*\] (.*) \(.*\)$/);
        if (stripUser != undefined) {
            user = stripUser[1];
        }
    } else {
        user = "";
    }
    console.log("User Out: " + user);
    return user;
}

function fixSerial(serial) {
    console.log("Serial In: " + serial);
    if (serial) {
        var stripSerial = serial.match(/^(.*) \(.*\)$/);
        if (stripSerial != undefined) {
            serial = stripSerial[1];
        }
    } else {
        serial = "";
    }
    console.log("Serial Out: " + serial);
    return serial;
}

angular.module("TokenModule", ["privacyideaAuth"])
    .factory("TokenFactory", function (auth, $http, $state, $rootScope, tokenUrl) {
        /**
         Each service - just like this service factory - is a singleton.
         */
        var error_func = function (error) {
            if (error.result.error.code == -401) {
                $state.go('login');
            } else {
                $rootScope.restError = error.result;
            }
        };

        return {
            getTokens: function (callback, params) {
                $http.get(tokenUrl, {
                    headers: {'Authorization': auth.getAuthToken()},
                    params: params
                }).success(callback
                ).error(error_func)
            },
            getTokenForSerial: function (serial, callback) {
                $http.get(tokenUrl + "?serial=" + serial, {
                    headers: {'Authorization': auth.getAuthToken()}
                }).success(callback
                ).error(error_func)
            },
            getTokenForUser: function (params, callback) {
                $http.get(tokenUrl, {
                    headers: {'Authorization': auth.getAuthToken()},
                    params: params
                }).success(callback
                ).error(error_func)
            },
            unassign: function (serial, callback) {
                $http.post(tokenUrl + "/unassign", {"serial": serial},
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            disable: function (serial, callback) {
                $http.post(tokenUrl + "/disable", {"serial": serial},
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            enable: function (serial, callback) {
                $http.post(tokenUrl + "/enable", {"serial": serial},
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            reset: function (serial, callback) {
                $http.post(tokenUrl + "/reset", {"serial": serial},
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            set: function (serial, key, value, callback) {
                var data = {};
                data[key] = value;
                $http.post(tokenUrl + "/set/" + serial, data,
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            setrealm: function (serial, realms, callback) {
                $http.post(tokenUrl + "/realm/" + serial, {realms: realms},
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            assign: function (params, callback) {
                /* if the user is in the select format
                 [ID] loginname (Givenname)
                 we need to convert it.
                 */
                $http.post(tokenUrl + "/assign", params,
                    {headers: {'Authorization': auth.getAuthToken()}}).success(callback
                ).error(error_func);
            },
            enroll: function (userObject, formdata, callback) {
                username = fixUser(userObject.user);
                // all formdata is passed
                var params = formdata;
                if (formdata.generate === true) {
                    params["genkey"] = 1;
                    params["otpkey"] = null;
                }
                params["pin"] = userObject.pin;
                if (username) {
                    params["user"] = username;
                    params["realm"] = userObject.realm;
                }
                $http.post(tokenUrl + "/init", params,
                    {headers: {'Authorization': auth.getAuthToken()}}
                ).success(callback
                ).error(error_func);
            },
            delete: function (serial, callback) {
                $http.delete(tokenUrl + "/" + serial,
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            },
            resync: function (params, callback) {
                $http.post(tokenUrl + "/resync", params,
                    {
                        headers: {'Authorization': auth.getAuthToken()}
                    }).success(callback
                ).error(error_func)
            }
        }
    });

