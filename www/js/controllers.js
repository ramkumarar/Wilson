angular.module('voicebankapp.controllers', ['angularMoment','voicebankapp.ob.services','voicebankapp.ai.services','voicebankapp.voice.services','voicebankapp.storage.services'])

.controller('AuthCtrl', function($scope,config,AuthService,AccountSummaryService,VoiceService,$state,$window) {

  
  var credentials= [
      {
        userName: 'ramkumar@gmail.com',
        password : 'rbs#1234'
      },
      {
        userName: 'stan@gmail.com',
        password: 'rbs#1234'
      },
      {
        userName: 'rakesh@gmail.com',
        password: 'rbs#1234'
      },
      {
        userName: 'unidentified'       
      }
    ];

  var users = {
      'I LOVE INDIA': function () {
        return credentials[0];
      },
      'HAVE A GOOD DAY': function () {
        return credentials[1];
      },
      'DONT BE EVIL': function() {
        return credentials[2];
      },
      'defaultMatch': function () {
        return credentials[3];
      }
    };



  $scope.data =config.authMessages;  



    

  function getUser (passPhrase) {
   
    return (users[passPhrase.toUpperCase()] || users['defaultMatch'])();
  }

  function getBank(userName) {
    var bank;
    switch(userName) {
      case 'ramkumar@gmail.com' :  bank="rbs";break;
      case 'stan@gmail.com'     :  bank="hsbc-test";break;
      case 'rakesh@gmail.com'     :  bank="rbs";break;
      default: bank='rbs';
    }
    return bank;

  }

  function login (passPhrase) {
    var user=getUser(passPhrase);
   $window.sessionStorage.setItem('userInfo-bank',getBank(user.userName));

    AuthService.authenticate(user.userName,user.password)
     .success(function(response) {
            console.log('Open Bank Authed :' + response);             
            $state.go('landing');            
             AccountSummaryService.getAccountSummary().then(function(response) {              
             $window.sessionStorage.setItem('userInfo-account', response.data[0].id);
              
            });
     }).error(function(error){
          handleAuthFailure();
        //Not able to login to OpenBank Service
     }) 

  //  console.log(user);
  }

  function verifyPassword(authChallengeResponse) {
    console.log('authChallengeResponse :' + authChallengeResponse);
    var userArray=Object.keys(users);
    
    var isUserExist= userArray.some(function(user) {  

         console.log('user:' + user)
        return authChallengeResponse.toUpperCase() === user.toUpperCase();
    });
    console.log('isUserExist :' +isUserExist);
    return isUserExist;
  }


  function handleAuthFailure() {
      VoiceService.doTextToSpeech($scope.data.messageAuthFailed)
      .success(function () {
             $state.go('login');
       })
      .error(function (reason) {
             // Handle the error case
       });
  }


  function recognizeSpeech() {

      var loginString='have a good day';
     
       var isMatching=verifyPassword(loginString);
          if(isMatching) {
            login(loginString)
          } 

      /*VoiceService.recognizeSpeech()
      .success(function(result){
       console.log('Voice Result' + result);          
          var isMatching=verifyPassword(result[0]);
          if(isMatching) {
            console.log('--------------------------' + isMatching);
            login(result[0])
          } else {
            handleAuthFailure();
          }

      })
      .error(function(errorMessage){
         console.log("Error message: " + errorMessage);
      }); */

  }

  $scope.voiceLogin= function() {
    

  /* VoiceService.doTextToSpeech($scope.data.authChallengeText)
   .success(recognizeSpeech)
   .error(function (reason) {
             // Handle the error case
    });*/
         
     recognizeSpeech();

  }
  
})
.controller('LandingCtrl', function($scope,$window,$ionicLoading,$ionicHistory,$state,$timeout,config) {
 
      $scope.items =config.items;
  
    $scope.logout = function(){
    $ionicLoading.show({template:'Logging out....'});
    $window.sessionStorage.removeItem('userInfo-token')
    $window.sessionStorage.removeItem('userInfo-bank')
    $window.sessionStorage.removeItem('userInfo-account')
    

    $timeout(function () {
        $ionicLoading.hide();
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });
        $state.go('login');
        }, 30);

};
 
})
.controller('AccountCtrl', function($scope,$state,OBAccounts) {  
  $scope.accounts = OBAccounts.data;

  
})
.controller('AccountDetailCtrl', function($scope,$state,OBAccount,OBTransactions) {

  var accountId=$state.params.id;  
  $scope.account = OBAccount.data;
  console.log(OBTransactions);

  var transactions=OBTransactions.data.transactions.map(function(transaction){
     if (transaction.details.value.amount.startsWith('-') ) {
        transaction.details.value.formattedamount=transaction.details.value.amount.slice(1);
        transaction.details.value.debit=true
     } else {
        transaction.details.value.debit=false;
        transaction.details.value.formattedamount=transaction.details.value.amount;
     }
     return transaction;

  }) 
 console.log(transactions);

  $scope.transactions=transactions;
})
.controller('VoiceCtrl', function($scope,$window,VoiceService,NLQueryService,AccountDetailService,TransactionService,PaymentService,StorageService) {    
 

  function getPayee(payeeName) {
    var selectedPayee;

    switch(payeeName.toUpperCase()) {
        case 'RAKESH' : 
              selectedPayee={"bank" : "rbs","accountId" : "26376828"};
              break;       

        default : selectedPayee={};
      }
      return selectedPayee;    
  }
 

  $scope.actionVoiceCommand=function() {   
    //var command="Get my account Balance";
    var initText="Transact by speaking";
    var command;
    var transactError ="I'm sorry, I don't have the answer to that yet."
    var accuracyError ="I'm sorry, I didn't catch the query.Can you try again"

    function handleQueryResponse(result){
      console.log(result);
      var propScore = result.score;
      var action = result.action;
      var responseSpeech=result.speech;
      var params=result.parameters;      
      
      if(propScore > .89  &&  action.startsWith("BANK.")) {
         doTextToSpeech(responseSpeech);  
         handleAction(action,params);
        
      } else if(action.startsWith("BANK.")) {
          doTextToSpeech(accuracyError);  
      }
      else {
         var sayMessage= (responseSpeech.length >0 ? responseSpeech : transactError )
         doTextToSpeech(sayMessage);         
      }

    }


    function handleAction(action,params) {
      switch(action) {
        case 'BANK.BALANCE_ENQUIRY' : 
              handleAccountAction(params);
              break;
        case 'BANK.MAKE_PAYMENT':
              console.log('Action and Params ' + action + params);
              handlePaymentAction(params);
              break;
        case 'BANK.TRANSACTIONS':
              handleTransactionAction(params)
              console.log('Action and Params ' + action + params);
              break;

        default : console.log('Action and Params ' + action + params);
      }
    }
    function replace(messageTemplate,replaceText) {
       var message=messageTemplate.replace(/%\w+%/g, function(all) {
          return replaceText[all] || all;
        });
        return message;
    }

    function handleAccountAction(params) {
      var messageTemplate='Your Account Balance is %balance% %currency%';

        var accountId=$window.sessionStorage.getItem('userInfo-account');
        AccountDetailService.getAccountDetail(accountId).then(function(response){
        var replacements={
                          "%balance%" : response.data.balance.amount ,
                          "%currency%" : response.data.balance.currency
                          };
        var message=replace(messageTemplate,replacements);
         doTextToSpeech(message);         
       })
    }

    function handleTransactionAction(params) {
       var accountId=$window.sessionStorage.getItem('userInfo-account');
       var transactions=TransactionService.getTransactions(accountId)
       .then(function(response){
       // var sortedTransactions=response.data.transactions.sort(function(a,b){return a.details.completed - b.details.completed});
       console.log(response); 
       })
     
    }


    function handlePaymentAction(params) {
       var fromAccountId=$window.sessionStorage.getItem('userInfo-account');
       var messageTemplate='Made a payment of  %amount% %currency% to %payeeName%';
       var highValueChallengeMessage='Since this is high value payment, You need your one time password to complete the transaction';
       //console.log('-------------------------' + JSON.stringify(params));
       var payeeName=params['given-name'];
       var currency=params['unit-currency'];
       var payee=getPayee(payeeName);
       //var amount=params['number'];
       var amount=1001;
       
       var transaction=PaymentService.makePayment(fromAccountId,payee.bank,payee.accountId,amount)
           .then(function(response) {
            console.log('-------------------------' + JSON.stringify(response));
            if(response.data.status === 'COMPLETED') {
              var replacements={
                              "%amount%" : amount ,
                              "%currency%": currency,
                              "%payeeName%" : payeeName
                              };
              var message=replace(messageTemplate,replacements);
              console.log(message);
             //doTextToSpeech(message);     
            } else if (response.status === 'INITIATED') {
              console.log(highValueChallengeMessage);
              StorageService.storePaymentTxId(response.data.id,response.data.challenge.id)
              .then(function(response){
                console.log('----------Done-----------');
              });
              

              //doTextToSpeech(highValueChallengeMessage); 


            } else {
               //Say Failure
            }
             
            });
            
      }

      function doHighValuePayment(params) {

      }
      
     


    function doTextToSpeech(text) {
        var handleSuccess=function() {

        };
        var handleFailure=function() {

        };

     /* VoiceService.doTextToSpeech(text)
       .success(handleSuccess)
       .error(handleFailure);    */
    }

    function handleNLQuery(command) {
      NLQueryService.query(command)
      .success(function(response){
        console.log(JSON.stringify(response.data));     
        
        handleQueryResponse(response.data.result)      

      }).error(function(error){
     })
    }

    /*VoiceService.doTextToSpeech(initText)
    .success(function () {
        VoiceService.recognizeSpeech()
          .success(function(result){
              console.log('Voice Result' + result);   
              handleNLQuery(result[0]);              
          })                  
     });*/
     
     var query='Please transfer 2 pounds to Rakesh';
     handleNLQuery(query);


}

    
});
