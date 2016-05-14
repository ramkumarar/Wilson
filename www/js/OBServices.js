angular.module('voicebankapp.ob.services', [])

.factory('AuthService', function($q,$http,$window) {
  
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  var consumer_key="xbgdf0dsfqqv4ghvlai02sqg3arwirn32frvpbvy";
  
  return {
    authenticate: function(userName,password) {
       var deferred=$q.defer();
       var promise=deferred.promise;
       var authString='username='+ userName + ',password=' + password + ',consumer_key=' + consumer_key;      

       $http({
                method: 'POST',
                url: SERVER_URL + '/my/logins/direct',
                headers: {
                    'Authorization': 'DirectLogin' + authString                     
                },
                data: ""
            }).then(function successCallback(response) {              
               $window.sessionStorage.setItem('userInfo-token', response.data.token);
                deferred.resolve(response);
            }, function errorCallback(response) {
                deferred.reject('Wrong credentials.');
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
})
.factory('AccountSummaryService', function($q,$http,$window) {

  var SERVER_URL ="https://apisandbox.openbankproject.com";
  var rbsAccountURI='/obp/v2.0.0/my/banks/rbs/accounts';
  var hsbcAccountURI='/obp/v2.0.0/my/banks/hsbc-test/accounts';
   var deferred=$q.defer();
  var promise=deferred.promise;    

    return {     
      getAccountSummary: function(){
        var token=$window.sessionStorage.getItem('userInfo-token');  
        var tokenHeader='DirectLogin token=' + token;

        var bank=$window.sessionStorage.getItem('userInfo-bank');
        var accountURI=(bank === 'rbs' ? rbsAccountURI :hsbcAccountURI);
        var url=SERVER_URL+accountURI;

        $http({
          method: 'GET', 
          url: url,
          headers: {'Authorization': tokenHeader}
         })
         .then(
           function successCallback(response){
             deferred.resolve(response);
           }
          ,function errorCallback(response) {
             deferred.reject('Account Detail Cannot be fetched.');
          });
          return promise;
      }
    };  
  
})
.factory('AccountDetailService',function($q,$http,$window) {
  // Might use a resource here that returns a JSON array
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  
  

  var deferred=$q.defer();
  var promise=deferred.promise;    

    return {     
      getAccountDetail: function(accountId){
        var token=$window.sessionStorage.getItem('userInfo-token');  
        var tokenHeader='DirectLogin token=' + token;
        var bank=$window.sessionStorage.getItem('userInfo-bank');
        var rbsAccountURI='/obp/v2.0.0/my/banks/rbs/accounts/' + accountId +'/account';
        var hsbcAccountURI='/obp/v2.0.0/my/banks/hsbc-test/accounts/' + accountId +'/account';
        var accountURI=(bank === 'rbs' ? rbsAccountURI :hsbcAccountURI);
        console.log('Bank  :' + bank);

        var url=SERVER_URL+accountURI;

        $http({
          method: 'GET', 
          url: url,
          headers: {'Authorization': tokenHeader}
         })
         .then(
           function successCallback(response){
             deferred.resolve(response);
           }
          ,function errorCallback(response) {
             deferred.reject('Account Detail Cannot be fetched.');
          });
          return promise;
      }
    };  
  
})
.factory('TransactionService',function($q,$http,$window) {
  // Might use a resource here that returns a JSON array
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  


  var deferred=$q.defer();
  var promise=deferred.promise;    

    return {     
      getTransactions: function(accountId){
      var token=$window.sessionStorage.getItem('userInfo-token');
      var tokenHeader='DirectLogin token=' + token;
       var bank=$window.sessionStorage.getItem('userInfo-bank');        
        var rbsAccountURI='/obp/v2.0.0/banks/rbs/accounts/' + accountId +'/owner/transactions';
        var hsbcAccountURI='/obp/v2.0.0/banks/hsbc-test/accounts/' + accountId +'/owner/transactions';
        console.log('Bank  :' + bank);
        var accountURI=(bank === 'rbs' ? rbsAccountURI :hsbcAccountURI);
        var url=SERVER_URL+accountURI;

        $http({
          method: 'GET', 
          url: url,
          headers: {'Authorization': tokenHeader}
         })
         .then(
           function successCallback(response){
             deferred.resolve(response);
           }
          ,function errorCallback(response) {
             deferred.reject('Account Detail Cannot be fetched.');
          });
          return promise;
      }
    };  
  
})
.factory('PaymentService',function($q,$http,$window) {
  // Might use a resource here that returns a JSON array
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  


  var deferred=$q.defer();
  var promise=deferred.promise;    

    return {     
      makePayment: function(fromAccountId,toBankId,toAccountId,amount){
      var token=$window.sessionStorage.getItem('userInfo-token');
      var tokenHeader='DirectLogin token=' + token;
       var bank=$window.sessionStorage.getItem('userInfo-bank');        
        var rbsAccountURI='/obp/v2.0.0/banks/rbs/accounts/' + fromAccountId +'/owner/transaction-request-types/SANDBOX_TAN/transaction-requests';
        var hsbcAccountURI='/obp/v2.0.0/banks/hsbc-test/accounts/' + fromAccountId +'/owner/transaction-request-types/SANDBOX_TAN/transaction-requests';
        console.log('Bank  :' + bank);
        var accountURI=(bank === 'rbs' ? rbsAccountURI :hsbcAccountURI);
        var url=SERVER_URL+accountURI;

        var paymentPayload= {
          "to": {
            "bank_id": toBankId,
            "account_id": toAccountId
          },
          "value": {
            "currency": "GBP",
            "amount": amount
          },
          "description": "Transaction created by voice banking services",
          "challenge_type": "SANDBOX_TAN"
        }

        console.log('Payment payload ' + JSON.stringify(paymentPayload)) ;

        $http({
          method: 'POST', 
          url: url,
          headers: {'Authorization': tokenHeader},
          data: paymentPayload
         })
         .then(
           function successCallback(response){
             deferred.resolve(response);
           }
          ,function errorCallback(response) {
             deferred.reject('Account Detail Cannot be fetched.');
          });
          return promise;
      }
    };  
  
})
.factory('OTPVertificationService',function($q,$http,$window) {
  // Might use a resource here that returns a JSON array
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  


  var deferred=$q.defer();
  var promise=deferred.promise;    

    return {     
      validateAuthCode: function(fromAccountId,paymentTransactionId,challengeId,challengeResponse){
      var token=$window.sessionStorage.getItem('userInfo-token');
      var tokenHeader='DirectLogin token=' + token;
       var bank=$window.sessionStorage.getItem('userInfo-bank');        
        var rbsAccountURI='/obp/v2.0.0/banks/rbs/accounts/' + fromAccountId +'/owner/transaction-request-types/SANDBOX_TAN/transaction-requests/' + paymentTransactionId + '/challenge';
        var hsbcAccountURI='/obp/v2.0.0/banks/hsbc-test/accounts/' + fromAccountId +'/owner/transaction-request-types/SANDBOX_TAN/transaction-requests/' + paymentTransactionId + '/challenge';
        console.log('Bank  :' + bank);
        var accountURI=(bank === 'rbs' ? rbsAccountURI :hsbcAccountURI);
        var url=SERVER_URL+accountURI;

        console.log('------------------> ' + challengeResponse);

        var challengeResponsePayload= {  
          "id":challengeId,  
          "answer":challengeResponse
        }

        console.log('Challenge payload ' + JSON.stringify(challengeResponsePayload)) ;

        $http({
          method: 'POST', 
          url: url,
          headers: {'Authorization': tokenHeader},
          data: challengeResponsePayload
         })
         .then(
           function successCallback(response){
             deferred.resolve(response);
           }
          ,function errorCallback(response) {
             deferred.reject('Account Detail Cannot be fetched.');
          });
          return promise;
      }
    };  
  
});

