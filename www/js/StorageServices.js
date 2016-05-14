angular.module('voicebankapp.storage.services', [])

.factory('StorageService', function($q,$window) {
  
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  var consumer_key="xbgdf0dsfqqv4ghvlai02sqg3arwirn32frvpbvy";
  
  return {
    storePaymentTxId: function(paymentId,challengeId) {
       var deferred=$q.defer();
       var promise=deferred.promise;

       setTimeout(function(){
        window.localStorage.setItem ("payment-tx-id", paymentId);
        window.localStorage.setItem ("payment-chal-id", challengeId);
        deferred.resolve()
      }, 0)
      return deferred.promise();

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
