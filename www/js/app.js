// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app=angular.module('voicebankapp', ['ionic','angularMoment','voicebankapp.controllers'])


app.config(function($stateProvider,$urlRouterProvider){
  $stateProvider.state('landing',{
    url:'/landing',
    templateUrl:'templates/landing.html',
    controller:'LandingCtrl'
  })
  .state('accountSummary',{
    url:'/accountSummary',
    templateUrl:'templates/accountSummary.html',
    controller:'AccountCtrl',
    resolve:{
              'OBAccounts':function(AccountSummaryService){
                 return AccountSummaryService.getAccountSummary();
               }
          }
    
  })
  .state('accountDetail',{
    url:'/accountDetail/:id',
    templateUrl:'templates/accountDetail.html',
    controller:'AccountDetailCtrl',
    resolve:{
              'OBAccount':function(AccountDetailService,$stateParams){                
               // console.log('----------------------------' + JSON.stringify($stateParams.id));
                 var id=$stateParams.id
                 return AccountDetailService.getAccountDetail(id);
               },
               'OBTransactions':function(TransactionService,$stateParams){
                 return TransactionService.getTransactions($stateParams.id);

               }
          }
   
   
  })
  .state('voiceTransaction',{
    url:'/voiceTransaction',
    templateUrl:'templates/voiceTransaction.html',
    controller: 'VoiceCtrl'
  })
  .state('placeHolder',{
    url:'/placeHolder',
    templateUrl:'templates/placeHolder.html'
  })
  .state('login', {
      url: '/login',
      templateUrl: 'templates/voice-login.html',
      controller: 'AuthCtrl'
  })
 


  $urlRouterProvider.otherwise('/login')

  

});


app.constant('config', {       
    authMessages : {
                authChallengeText: 'Identify Yourself by saying pass phrase',
                messageInternalError : 'Oh no, Not able to reach the Cloud service',
                messageAuthFailed : 'I dont recogonize you. Try again'

    },

    items: [{
        title: "Accounts/Deposits",
        icon: "fa-university",
        link: "#/accountSummary"
      }
      , {
        title: "Voice Services",    
        icon: "fa-microphone",
        link: "#/voiceTransaction"
      }
      , {
        title: "Fund Transfer",    
        icon: "fa-paper-plane",
        link: "#/placeHolder"
      }, {
        title: "Bill Payment",    
        icon: "fa-paypal",
        link: "#/placeHolder"
      }, {
        title: "Cards,Loans",    
        icon: "fa-credit-card",
        link: "#/placeHolder"
      }, {
        title: "Investments",    
        icon: "fa-money",
        link: "#/placeHolder"
      }, {
        title: "Offers",    
        icon: "fa-gift",
        link: "#/placeHolder"
      },{
        title: "Contact Us",    
        icon: "fa-phone",
        link: "#/placeHolder"
      }
      
    ]
});



app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {      
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);      
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
