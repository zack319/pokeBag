var pokeApp = angular.module('pokeApp', ['ngRoute']);

pokeApp.config = function ($httpProvider, $routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'index.html',
            controller: 'PokemonController'
        });
};

pokeApp.directive('objectInfo', function() {
    return {
        restrict: 'E',
        templateUrl: '/template/objectInfo.html',
        controller: 'PokemonController'
    };
});

pokeApp.directive('pokemonInfo', function() {
    return {
        restrict: 'E',
        templateUrl: '/template/pokemonInfo.html',
        controller: 'PokemonController'
    };
});

pokeApp.directive('pokemonBag', function() {
    return {
        restrict: 'E',
        templateUrl: '/template/pokemonBag.html',
        controller: 'PokemonController'
    };
});

pokeApp.factory('pokeDataFactory', function pokeDataFactory($http, $location) {
    var service = {};
    // service.pokeList = $http.get('/api/pokemon').then(complete).catch(failed);
    // console.log(service.pokeList);

    service.pokemonList = function() {
        return $http.get('/api/pokemon').then(complete).catch(failed);
    }

    service.objectList = function() {
        return $http.get('/api/object').then(complete).catch(failed);
    }

    service.pokemonInfo = function(name) {
        return $http.get('/api/pokemon/'+ name).then(complete).then($location.path('/home.html')).catch(failed);
    }

    service.objectInfo = function(name) {
        return $http.get('/api/object/'+ name).then(complete).then($location.path('/home.html')).catch(failed);
    }

    service.addPokemon = function(data) {
        return $http.post('/api/pokemon', data).then(complete).catch(failed);
    }

    service.addObject = function(data) {
        return $http.post('/api/object', data).then(complete).catch(failed);
    }

    service.bagContent = function() {
        return $http.get('/api/bag').then(complete).catch(failed);
    }

    service.deletePokemon = function(data) {
        return $http.delete('/api/bag/pokemon/' + data).then(complete).catch(failed);
    }

    service.evolvePokemon = function(data = false, levelUP = false, item = false, update = false) {
        if (update && !levelUP) {
            return $http.put('/api/bag/pokemon/update/' + data, {'item': item}).then(complete).catch(failed);
        } else if (!item && !update) {
            return $http.put('/api/bag/pokemon/' + data, {'levelUP': levelUP}).then(complete).catch(failed);
        } else if (!update) {
            return $http.put('/api/bag/pokemon/' + data, {'levelUP': levelUP, 'item': item}).then(complete).catch(failed);
        } else if (!item && !update && !levelUP) {
            return $http.put('/api/bag/pokemon/' + data).then(complete).catch(failed);
        }
    }

    service.addOneObject = function(data, flag = true) {
        console.log('adding ONE object');
        return $http.put('/api/bag/object/' + data, {'flag': flag}).then(complete).catch(failed);
    }

    service.deleteObject = function(data) {
        return $http.delete('/api/bag/object/' + data).then(complete).catch(failed);
    }


    function complete(response) {
        return response;
    }

    function failed(error) {
        console.log(error.statusText);
    }

    return service;
});

pokeApp.controller('PokemonController', function PokemonController($scope, $route, $location, $window, $timeout, pokeDataFactory) {
    //Pokedex ability
    $scope.pokemonName = "";
    $scope.pokeInfo;
    $scope.objectInfo;
    $scope.title = 'Your Pokemon Bag';

    $scope.pokemonBag = [];
    $scope.bag = {};
    $scope.bag.pokemons = '';
    $scope.bag.objects = '';

    $scope.addPokemonToBag = false;
    $scope.levelUpCondition = false;
    $scope.evolveCondition = false;

    var checkForCandy = function() {
        for (var i=0; i<$scope.bag.objects.length; i++) {
            if ($scope.bag.objects[i].name == 'rare-candy' && $scope.bag.objects[i].quantity >= 1) {
                $scope.levelUpCondition = true;
            }
        }
    };

    var checkHeldItem = function() {
        //checking if pokemon has an item held
        //if yes return item name || assign it to $scope.heldItem
        for (var i=0; i<$scope.bag.pokemons.length; i++) {
            if ($scope.bag.pokemons[i].held_items.length > 0) {
                // console.log($scope.bag.pokemons[i].evolutionInfo.evolutionDetails.item);
                if ($scope.bag.pokemons[i].evolutionInfo.evolutionDetails.item && $scope.bag.pokemons[i].held_items[0].name == $scope.bag.pokemons[i].evolutionInfo.evolutionDetails.item.name) {
                    $scope.heldItem = $scope.bag.pokemons[i].held_items[0].name;
                    $scope.evolveCondition = true;
                } else {
                    $scope.evolveCondition = false;
                }
            }
        }
    };

    pokeDataFactory.pokemonList().then(function (response) {
        $scope.pokeList = response.data;
        pokeDataFactory.objectList().then(function (resp) {
            $scope.objectList = resp.data;
            checkForCandy();
        });
    });

    $scope.pokemonInfo = function(name) {
        pokeDataFactory.pokemonInfo(name).then(function (response) {
            $scope.pokeInfo = response.data;
        });
    };

    $scope.objectInfo = function(name) {
        pokeDataFactory.objectInfo(name).then(function (response) {
            $scope.objectInfo = response.data;
        });
    };

    $scope.addPokemon = function(name) {
        var postData = {
            name: name,
            pokemonList: $scope.pokeList
        }
        pokeDataFactory.addPokemon(postData).then(function (response) {
            $scope.pokemonBag.push(response);
            $window.location.reload();
        });
    };

    $scope.assignItem = function (item, pokemonName) {
        var pokemonID;
        for (var i=0; i<$scope.bag.pokemons.length; i++) {
            if ($scope.bag.pokemons[i].name == pokemonName) {
                pokemonID = $scope.bag.pokemons[i]._id;
                if (item == 'rare-candy') {
                    $scope.levelUp(pokemonID);
                } else {
                    $scope.addObject(item, true);
                    $timeout(function() {
                        pokeDataFactory.evolvePokemon(pokemonID, false, item, true).then(function(response) {
                            $scope.pokemonBag.push(response);
                            $window.location.reload();
                        });
                    });
                }
            }
        }
    };

    //Method to add item to bag or update/delete quantity of item if found in bag
    $scope.addObject = function(name, deleteQ = false) {
        var quantityUpdated = false;
        var action = false;
        var postData = {
            name: name,
            objectList: $scope.objectList
        };

        if ($scope.bag.objects.length > 0) {
            for (var i=0; i<$scope.bag.objects.length; i++) {
                if (name == $scope.bag.objects[i].name) {
                    if (deleteQ) {
                        action = true;
                        if ($scope.bag.objects[i].quantity == 1) {
                            pokeDataFactory.deleteObject($scope.bag.objects[i]._id).then(function (response) {
                                $scope.pokemonBag.push(response);
                            });
                        } else {
                            console.log('heyyyy');
                            quantityUpdated = false;
                            pokeDataFactory.addOneObject($scope.bag.objects[i]._id, quantityUpdated).then(function (response) {
                                $scope.pokemonBag.push(response);
                            });
                        }
                    } else {
                        action = true;
                        quantityUpdated = true;
                        console.log('flag and id update object');
                        pokeDataFactory.addOneObject($scope.bag.objects[i]._id, quantityUpdated).then(function (response) {
                            $scope.pokemonBag.push(response);
                        });
                        checkHeldItem();
                        // $window.location.reload(); 
                    }
                    break;
                } else {
                    continue;
                }
            }
            if (!action) {
                pokeDataFactory.addObject(postData).then(function (response) {
                    $scope.pokemonBag.push(response);
                });
                checkHeldItem();
                $window.location.reload();
            } 
            // else if (deleteQ == true) {
            //     console.log('hiiiiiii');
            //     var data = {
            //         id : $scope.bag.objects[i]._id,
            //         flag : deleteQ
            //     }
            //     pokeDataFactory.addOneObject(data).then(function (response) {
            //         $scope.pokemonBag.push(response);
            //     });
            // }
        } else {
            pokeDataFactory.addObject(postData).then(function (response) {
                $scope.pokemonBag.push(response);
            });
            checkHeldItem();
            $window.location.reload();
        }
    };

    pokeDataFactory.bagContent().then(function (response) {
        $scope.bag.pokemons = response.data.pokemons;
        $scope.bag.objects = response.data.objects;
        checkHeldItem();
    });

    $scope.evolvePokemon = function(id, levelUP = false) {
        if ($scope.heldItem) {
            for (var i=0; i<$scope.bag.objects.length; i++) {
                if ($scope.bag.objects[i].name == $scope.heldItem) {
                    $scope.addObject($scope.heldItem, true);
                }
            }
            pokeDataFactory.evolvePokemon(id, levelUP, $scope.heldItem).then(function (response) {
                $window.location.reload();
            });
        } else {
            pokeDataFactory.evolvePokemon(id, levelUP).then(function (response) {
                $window.location.reload();
            });
        }
    };

    $scope.levelUp = function(id) {
        $scope.addObject('rare-candy', true);
        $timeout(function() {
            $scope.evolvePokemon(id, true);
        }, 0);
    };

    $scope.deletePokemon = function(id) {
        pokeDataFactory.deletePokemon(id).then(function (response) {
            $window.location.reload();
        });
    };

    $scope.deleteObject = function(id) {
        pokeDataFactory.deleteObject(id).then(function (response) {
            $window.location.reload();
        });
    };
});