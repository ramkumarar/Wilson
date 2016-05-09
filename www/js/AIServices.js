angular.module('voicebankapp.ai.services', [])

.factory('NLQueryService', function($q,$http) {
  
  var accessToken="818575454b3f491386ed7619893f0395",
      subscriptionKey = "5d27767b36dd4f27baa9e61fb4c2361c",
      baseUrl = "https://api.api.ai/v1/";
  
  return {
    query: function(queryText) {
       var deferred=$q.defer();
       var promise=deferred.promise;

       $http({
                method: 'POST',
                url: baseUrl + "query/",
                headers: {
                        "Authorization": "Bearer " + accessToken,
                        "ocp-apim-subscription-key": subscriptionKey
                },                
                data: JSON.stringify({q: queryText, lang: "en"}),
            }).then(function successCallback(response) {                            
                deferred.resolve(response);
            }, function errorCallback(response) {
                deferred.reject('Unable to process the query');
            });


       promise.success = function(fn) {
                promise.then(fn);
                return promise;
       }
       promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
       }

       return promise;
     
    }
  };
});
