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
  
});

/*.factory('AccountSummaryService', function($http,$window) {
  // Might use a resource here that returns a JSON array
  var SERVER_URL ="https://apisandbox.openbankproject.com";
  var accountURI='/obp/v2.0.0/my/banks/rbs/accounts';
  var token=$window.sessionStorage.getItem('userInfo-token');
  var tokenHeader='DirectLogin token=' + token;
  var url=SERVER_URL+accountURI;

  var myData = null;
    
  var promise = $http({
    method: 'GET', 
    url: url,
    headers: {'Authorization': tokenHeader}
   })
   .then(function successCallback(data){
       myData = data;
    });

    return {
      promise:promise,
      setData: function (data) {
          myData = data;
      },
      fetch: function () {
          return myData;//.getSomeData();
      }
    };  
  
})*/


