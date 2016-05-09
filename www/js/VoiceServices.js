angular.module('voicebankapp.voice.services', [])

.factory('VoiceService', function($q) { 
   
  return {
     recognizeSpeech: function () {
        var maxMatches = 1;
        var promptString = "Speak now"; // optional
        var language = "en-US";                     // optional
        var deferred=$q.defer();
        var promise=deferred.promise;


        window.plugins.speechrecognizer
        .startRecognize(function(response) {
          deferred.resolve(response);
        },function(error){
          deferred.reject(error);
        }, maxMatches, promptString, language);

        promise.success = function(fn) {
                promise.then(fn);
                return promise;
        }
        promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
        }

        return promise;

    },
    doTextToSpeech:function(text) {

        var deferred=$q.defer();
        var promise=deferred.promise;

      TTS.speak({
             text: text,
             locale: 'en-US',
             rate: 1.00
         }, function() {
             deferred.resolve('success');
         },function(error) {
             deferred.reject(error);
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
