angular.module('voicebankapp.controllers', ['angularMoment','voicebankapp.ob.services','voicebankapp.ai.services','voicebankapp.voice.services','voicebankapp.storage.services','voicebankapp.otp.services','ngLodash'])

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

    /*  var loginString='have a good day';
     
       var isMatching=verifyPassword(loginString);
          if(isMatching) {
            login(loginString)
          } */

      VoiceService.recognizeSpeech()
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
      }); 

  }

  $scope.voiceLogin= function() {
    

   VoiceService.doTextToSpeech($scope.data.authChallengeText)
   .success(recognizeSpeech)
   .error(function (reason) {
             // Handle the error case
    });
         
    // recognizeSpeech();

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
.controller('VoiceCtrl', function($scope,$window,VoiceService,NLQueryService,AccountDetailService,TransactionService,PaymentService,StorageService,OTPService,OTPVertificationService,lodash) {    
 

  function getPayee(payeeName) {
    var selectedPayee;

    switch(payeeName.toUpperCase()) {
        case 'RAKESH' : 
              selectedPayee={"bank" : "rbs","accountId" : "26376828"};
              break;       

        default : selectedPayee={"bank" : "rbs","accountId" : "26376828"};
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
      
      if(propScore > .85  &&  action.startsWith("BANK.")) {
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
              handleTransactionAction(params);
              console.log('Action and Params ' + action + params);
              break;
        case 'BANK.OTPAUTH' :
              console.log('Action and Params ' + action + params);
              doHighValuePayment(params); break;

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
       var transPeriod = params.TransactionPeriod;
       console.log('TransactionPeriod:: '+ transPeriod);       
       var accountId=$window.sessionStorage.getItem('userInfo-account');
       var transactions=TransactionService.getTransactions(accountId)
       .then(function(response){          
          var messageTemplate;
          var replacements;

          switch (transPeriod) {            
            case 'last ':
               messageTemplate='Your last transaction was a %transType% for an amount of %amount% GBP';
               replacements={
                      "%transType%" : response.data.transactions[0].details.value.amount>0 ? 'Credit' : 'Debit',
                      "%amount%" : response.data.transactions[0].details.value.amount < 0 ? response.data.transactions[0].details.value.amount * -1 : response.data.transactions[0].details.value.amount
                      };
               break;
            case 'week':
                var last7DayStart = moment().startOf('day').subtract(1,'week');
                var yesterdayEndOfRange =  moment().endOf('day').subtract(1,'day');
                var totalTrans = response.data.transactions;
                var filteredTrans = lodash.filter(totalTrans, function(transaction){ 
                        return moment(transaction.details.completed).isBetween(last7DayStart,yesterdayEndOfRange);
                });

                var debitTrans = lodash.filter(filteredTrans, function(transaction){
                    return transaction.details.value.amount >0;
                });
                var creditTrans = lodash.filter(filteredTrans, function(transaction){
                    return transaction.details.value.amount <0;
                });

               messageTemplate='You have done %totalNumber% transactions. Of the  %totalNumber% transactions there are %debitCount%  debits and %creditCount% credits';
               replacements={
                      "%totalNumber%": filteredTrans.length,
                      "%debitCount%": debitTrans.length ==0 ? '0' : debitTrans.length,
                      "%creditCount%": creditTrans.length==0 ? '0' : creditTrans.length
                }; 
               break;

            case 'default':
                messageTemplate='I could not recognize you, please try again';
                replacements={}; 
               break;               
         }

       
        var message=replace(messageTemplate,replacements);       
        console.log(message);
        doTextToSpeech(message);   
       });              
    }


    function handlePaymentAction(params) {
       var fromAccountId=$window.sessionStorage.getItem('userInfo-account');
       var messageTemplate='Made a payment of  %amount% %currency% to %payeeName%';
       var highValueChallengeMessage='Since this is high value payment, You need your one time password to complete the transaction';       
       var payeeName=params['given-name'];
       var currency=params['unit-currency'];
       var payee=getPayee(payeeName);
       var amount=params['number'];

       console.log('Payee Bank ' + payee.bank);
       console.log('Payee Bank ' + payee.accountId);
       console.log('Payee amount ' + payee.amount);
       
       var transaction=PaymentService.makePayment(fromAccountId,payee.bank,payee.accountId,amount)
           .then(function(response) {
            //console.log('-------------------------' + JSON.stringify(response));
            if(response.data.status === 'COMPLETED') {
              var replacements={
                              "%amount%" : amount ,
                              "%currency%": 'GBP',
                              "%payeeName%" : payeeName
                              };
              var message=replace(messageTemplate,replacements);
              console.log(message);
             doTextToSpeech(message);     
            } else if (response.data.status === 'INITIATED') {
              console.log(highValueChallengeMessage);
              //doTextToSpeech(highValueChallengeMessage); 
              var transactionId=response.data.id;
              var challengeId=response.data.challenge.id;
              StorageService.storePaymentTxId(transactionId,challengeId)
              .then(function(response){
                 console.log('Before Sending Message ---------------');
                 var challengeResponse="123345";
                 doHighValuePayment(challengeResponse)
                // OTPService.sendAuthCode(transactionId,amount);
              });

            } else {
               //Say Failure
            }
             
            });
            
      }

      function doHighValuePayment(params) { 


        var fromAccountId=$window.sessionStorage.getItem('userInfo-account');       
        var transactionId=StorageService.getInflightPayment().paymentTransactionId;
        var challengeId=StorageService.getInflightPayment().challengeId;
        var challengeResponse="12345";

        OTPVertificationService.validateAuthCode(fromAccountId,transactionId,challengeId,challengeResponse)
        .then(function(response) {
          console.log("Your Payment Transfer is now complete")
        })
      }
      
     


    function doTextToSpeech(text) {
        var handleSuccess=function() {

        };
        var handleFailure=function() {

        };

      VoiceService.doTextToSpeech(text)
       .success(handleSuccess)
       .error(handleFailure);    
    }

    function handleNLQuery(command) {
      NLQueryService.query(command)
      .success(function(response){
        console.log(JSON.stringify(response.data));     
        
        handleQueryResponse(response.data.result)      

      }).error(function(error){
     })
    }

    VoiceService.doTextToSpeech(initText)
    .success(function () {
        VoiceService.recognizeSpeech()
          .success(function(result){
              console.log('Voice Result' + result);   
              handleNLQuery(result[0]);              
          })                  
     });
     
     //var query='Password is rocket science';
    // handleNLQuery(query);


}

    
});
