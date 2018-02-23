/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
(function () {
    "use strict";

    angular
        .module("app")
        .controller("lookupOption", lookupOption);

    lookupOption.$inject = ["$scope", "$state", "$stateParams", "lookupOptionResource", "notifications", "appSettings", "$q", "errorService", "lookupResource"];
    function lookupOption($scope, $state, $stateParams, lookupOptionResource, notifications, appSettings, $q, errorService, lookupResource) {

        var vm = this;
        vm.loading = true;
        vm.appSettings = appSettings;
        vm.user = null;
        vm.save = save;
        vm.delete = del;
        vm.isNew = $stateParams.lookupOptionId === vm.appSettings.newGuid;

        initPage();

        function initPage() {

            var promises = [];

            $q.all(promises)
                .then(() => {

                    if (vm.isNew) {

                        vm.lookupOption = new lookupOptionResource();
                        vm.lookupOption.lookupOptionId = appSettings.newGuid;
                        vm.lookupOption.lookupId = $stateParams.lookupId;
                        vm.lookupOption.sortOrder = 0;

                        promises = [];

                        promises.push(
                            lookupResource.get(
                                {
                                    lookupId: $stateParams.lookupId
                                },
                                data => {
                                    vm.lookup = data;
                                    vm.project = vm.lookup.project;
                                },
                                err => {

                                    if (err.status === 404) {
                                        notifications.error("The requested lookup does not exist.", "Error");
                                    } else {
                                        notifications.error("Failed to load the lookup.", "Error", err);
                                    }

                                    $state.go("app.lookup", { projectId: $stateParams.projectId, lookupId: $stateParams.lookupId });

                                })
                                .$promise);

                        $q.all(promises).finally(() => vm.loading = false);

                    } else {

                        promises = [];

                        promises.push(
                            lookupOptionResource.get(
                                {
                                    lookupOptionId: $stateParams.lookupOptionId
                                },
                                data => {
                                    vm.lookupOption = data;
                                    vm.lookup = vm.lookupOption.lookup;
                                    vm.project = vm.lookup.project;
                                },
                                err => {

                                    if (err.status === 404) {
                                        notifications.error("The requested lookup option does not exist.", "Error");
                                    } else {
                                        notifications.error("Failed to load the lookup option.", "Error", err);
                                    }

                                    $state.go("app.lookup", { projectId: $stateParams.projectId, lookupId: $stateParams.lookupId });

                                })
                                .$promise);


                        $q.all(promises).finally(() => vm.loading = false);
                    }
                });
        }

        function save() {

            if ($scope.mainForm.$invalid) {

                notifications.error("The form has not been completed correctly.", "Error");

            } else {

                vm.loading = true;

                vm.lookupOption.$save(
                    data => {

                        vm.lookupOption = data;
                        notifications.success("The lookup option has been saved.", "Saved");
                        if (vm.isNew)
                            $state.go("app.lookupOption", {
                                lookupOptionId: vm.lookupOption.lookupOptionId
                            });

                    },
                    err=> {

                        errorService.handleApiError(err, "lookup option");

                    }).finally(() => vm.loading = false);

            }
        };

        function del() {

            if (confirm("Confirm delete?")) {

                vm.loading = true;

                lookupOptionResource.delete(
                    {
                        lookupOptionId: $stateParams.lookupOptionId
                    },
                    () => {

                        notifications.success("The lookup option has been deleted.", "Deleted");
                        $state.go("app.lookup", { projectId: $stateParams.projectId, lookupId: $stateParams.lookupId });

                    }, err => {

                        errorService.handleApiError(err, "lookup option", "delete");

                    })
                    .$promise.finally(() => vm.loading = false);

            }
        }
    };

} ());
