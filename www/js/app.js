// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ionicApp', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.service('wordPressService', ['$http', '$rootScope',function ($http, $rootScope) {
    
    this.blogs = '';
    this.loadBlogs = function (param) {
      $http.get('https://public-api.wordpress.com/rest/v1.1/freshly-pressed/',{
        params:param
      })
      .success(function(result){
          console.log(result);
          this.blogs = result;
          //return this.blogs;

          //Using Broadcast (Publisher-Subscibr Pattern)
          $rootScope.$broadcast('broadcastBlogs', result);
      });
    }
}])

.controller('mainCtrl', ['$scope','wordPressService', '$ionicLoading',
 '$sce', '$ionicListDelegate','$ionicPlatform',
 function ($scope, wordPressService, $ionicLoading,
  $sce,  $ionicListDelegate, $ionicPlatform) {
    
    $ionicLoading.show({
      template: 'Loading Blogs...'
    });

    $scope.deviceReady = false;
    $ionicPlatform.ready(function (argument) {
      $scope.$apply(function(){
        console.log('device ready....');
        $scope.deviceReady = true;
      })
    });

    $scope.blogs = [];
    $scope.param = {};
    $scope.$on('broadcastBlogs', function (event, blogResult) {
        
        // Adding to blog 
        blogResult.posts.forEach(function (arrItem) {
          $scope.blogs.push({
            author: arrItem.author,
            title: $sce.trustAsHtml(arrItem.title),
            url: arrItem.URL,
            excerpt: $sce.trustAsHtml(arrItem.excerpt),
            featured_image: arrItem.featured_image
          })
        });

        //setting up scope
        $scope.param.before = blogResult.date_range.oldest;

        //pull up list from screen bottom
        $scope.$broadcast('scroll.infiniteScrollComplete');

        //pull down list from screen up
        $scope.$broadcast('scroll.refreshComplete');

        //Hide
        $ionicLoading.hide();
    });

    $scope.loadMoreBlogs = function(){
      //calling service to load blogs
      wordPressService.loadBlogs($scope.param);
    } 

    // reloading blogs on refresh
    $scope.reloadBlogs = function () {
      $scope.blogs = [];
      $scope.param = {};
      wordPressService.loadBlogs();
    }

    //Using InAppBrowser Plugin Cordova
    $scope.showBlog = function(index) {
      cordova.InAppBrowser.open($scope.blogs[index].url, "_blank", "location=no")
    }

    $scope.shareBlog = function (index) {
      $ionicListDelegate.closeOptionButtons();

      var message = {
          text: "Found Aricle Interesting !! So Sharing with you via@blog_app : "+$scope.blogs[index].title,
          url: $scope.blogs[index].url
      };
      window.socialmessage.send(message);
    }
}])
