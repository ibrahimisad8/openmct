/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define,Promise,describe,it,expect,beforeEach,waitsFor,jasmine*/

/**
 * MCTIncudeSpec. Created by vwoeltje on 11/6/14.
 */
define(
    ["../src/MCTInclude"],
    function (MCTInclude) {
        "use strict";

        describe("The mct-include directive", function () {
            var testTemplates,
                testUrls,
                mockLinker,
                mockScope,
                mockElement,
                testAttrs,
                mockChangeTemplate,
                mctInclude;

            function fireWatch(expr, value) {
                mockScope.$parent.$watch.calls.forEach(function (call) {
                    if (call.args[0] === expr) {
                        call.args[1](value);
                    }
                });
            }

            beforeEach(function () {
                testTemplates = [
                    {
                        key: "abc",
                        bundle: { path: "a", resources: "b" },
                        templateUrl: "c/template.html"
                    },
                    {
                        key: "xyz",
                        bundle: { path: "x", resources: "y" },
                        templateUrl: "z/template.html"
                    }
                ];
                testUrls = {};
                testTemplates.forEach(function (t, i) {
                    testUrls[t.key] = "some URL " + String(i);
                });
                mockLinker = jasmine.createSpyObj(
                    'templateLinker',
                    ['link', 'getPath']
                );
                mockScope = jasmine.createSpyObj('$scope', ['$watch', '$on']);
                mockScope.$parent =
                    jasmine.createSpyObj('parent', ['$watch', '$eval']);
                mockElement = jasmine.createSpyObj('element', ['empty']);
                mockChangeTemplate = jasmine.createSpy('changeTemplate');
                mockLinker.link.andReturn(mockChangeTemplate);
                mockLinker.getPath.andCallFake(function (template) {
                    return testUrls[template.key];
                });
                mctInclude = new MCTInclude(testTemplates, mockLinker);
                testAttrs = {
                    key: "parentKey",
                    mctModel: "someExpr",
                    ngModel: "someOtherExpr"
                };
                mctInclude.link(mockScope, mockElement, testAttrs);
            });

            it("is restricted to elements", function () {
                expect(mctInclude.restrict).toEqual("E");
            });

            it("exposes templates via the templateLinker", function () {
                expect(mockLinker.link)
                    .toHaveBeenCalledWith(mockScope, mockElement, undefined);
            });

            it("reads a template location from a scope's key variable", function () {
                fireWatch(testAttrs.key, 'abc');
                expect(mockChangeTemplate)
                    .toHaveBeenCalledWith(testTemplates[0]);

                fireWatch(testAttrs.key, 'xyz');
                expect(mockChangeTemplate)
                    .toHaveBeenCalledWith(testTemplates[1]);
            });

            it("watches for changes on both ng-model and mct-model", function () {
                expect(mockScope.$parent.$watch).toHaveBeenCalledWith(
                    testAttrs.ngModel,
                    jasmine.any(Function),
                    false
                );
                expect(mockScope.$parent.$watch).toHaveBeenCalledWith(
                    testAttrs.mctModel,
                    jasmine.any(Function),
                    false
                );
            });

        });
    }
);
