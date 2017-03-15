(function () {
    "use strict";
    var module = angular.module("app", ["ionic"]);

    module.run(["$ionicPlatform", function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    }]);

    module.config(["$ionicConfigProvider", function ($ionicConfigProvider) {
        $ionicConfigProvider.backButton.previousTitleText(false).text('');
    }]);

    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('tabs', {
                url: '/tabs',
                templateUrl: "tabs.html",
                abstract: true,
            })
            .state('tabs.home', {
                url: '/home',
                views: {
                    'tab1': {
                        templateUrl: "home-template.html",
                        controller: "homeController",
                        controllerAs: "homeCtl"
                    }
                }
            })
            .state('tabs.detail', {
                url: '/detail/:id',
                views: {
                    'tab1': {
                        templateUrl: "detail-template.html",
                        controller: "detailController",
                        controllerAs: "detailCtl"
                    }
                }
            })
            .state('tabs.favoritosdetail', {
                url: '/detail/:id',
                views: {
                    'tab2': {
                        templateUrl: "detail-template.html",
                        controller: "detailController",
                        controllerAs: "detailCtl"
                    }
                }
            })
            .state('tabs.favoritos', {
                url: '/favoritos',
                views: {
                    'tab2': {
                        templateUrl: "favoritos-template.html",
                        controller: "favoritosController",
                        controllerAs: "favoritosCtl"
                    }
                }
            });

        $urlRouterProvider.otherwise('/tabs/home');
}]);

})();

(function (module) {
    "use strict";
    module.factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || defaultValue);
            }
        }
}]);

    module.factory("DataStore", ["$localstorage", function ($localstorage) {
        var receitas = [];
        var favoritos = $localstorage.getObject('favoritos', '[]');
        var findWithAttr = function (array, attr, value) {
            for (var i = 0; i < array.length; i += 1) {
                if (array[i][attr] === value) {
                    return i;
                }
            }
            return -1;
        };

        var adicionarFavorito = function (receita) {
            var index = findWithAttr(favoritos, "id", receita.id);
            if (index != -1) {
                favoritos.splice(index, 1);
            } else {
                favoritos.push(receita);
            }
            $localstorage.setObject('favoritos', favoritos);

        };

        var removerFavorito = function (receita) {

        };

        return {
            receitas: receitas,
            favoritos: favoritos,
            adicionarFavorito: adicionarFavorito
        }
    }]);
    
}(angular.module("app")));

(function (module) {
    "use strict";
    module.controller("homeController", ["$scope", "$http", "$ionicLoading", "DataStore", function ($scope, $http, $ionicLoading, DataStore) {
        var self = this;
        this.receitas = [];

        this.getReceitas = function () {
            $ionicLoading.show({
                template: 'Loading...'
            });
            $http.get("https://dl.dropboxusercontent.com/s/zmpzd7a3wug79y4/receitas.json?dl=1")
                .success(function (data) {
                    self.receitas = data;
                    DataStore.receitas = self.receitas;
                    $ionicLoading.hide();
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .error(function (error) {
                    DataStore.receitas.length = 0;
                    $ionicLoading.hide();
                });
        };
        
        this.adicionarFavorito = function(receita){
            DataStore.adicionarFavorito(receita);
        };
        if (DataStore.receitas.length === 0) {
            this.getReceitas();
        }
    }]);

}(angular.module("app")));

(function (module) {
    "use strict";
    module.controller("detailController", ["$stateParams", "DataStore", function ($stateParams, DataStore) {
        var self = this;
        var id = $stateParams.id;
        this.receita = DataStore.receitas.filter(function (r) {
            return r.id == id;
        })[0];

        this.adicionaFavorito = function () {
            DataStore.adicionarFavorito(self.receita);
            self.isFavorito = DataStore.favoritos.filter(function (r) {
                return r.id == self.receita.id;
            }).length > 0;
        };

        this.isFavorito = DataStore.favoritos.filter(function (r) {
            return r.id == self.receita.id;
        }).length > 0;
    }]);

}(angular.module("app")));

(function (module) {
    "use strict";
    module.controller("favoritosController", ["$stateParams", "DataStore", function ($stateParams, DataStore) {
        var self = this;
        this.receitas = DataStore.favoritos;
        
        this.removerFavorito = function(receita){
            DataStore.adicionarFavorito(receita);
        };
    }]);

}(angular.module("app")));