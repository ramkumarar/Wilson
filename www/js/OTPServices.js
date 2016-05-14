angular.module('voicebankapp.otp.services', [])
.factory('OTPService', function($q,$http) {

 var url="http://536a2e59.ngrok.io/api/send-sms";

 
  
  return {
    sendAuthCode: function(paymentTranId,paymentAmount) {
            
       var deferred=$q.defer();
       var promise=deferred.promise;

       var msgPayLoad={
          "paymentTransId": paymentTranId,
          "paymentAmount":paymentAmount,
          "contactNumber" :"+919884918586"
       }

      $http({
          method: 'POST', 
          url: url,         
          data: msgPayLoad
         })
         .then(
           function successCallback(response){
             deferred.resolve(response);
           }
          ,function errorCallback(response) {
             deferred.reject('Account Detail Cannot be fetched.');
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
