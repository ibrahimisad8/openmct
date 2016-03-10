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
/*global define*/

define(
    function (){
        "use strict";

        var PREFIX = "msl_tlm:",
            FORMAT_MAPPINGS = {
                float: "number",
                integer: "number",
                string: "string"
            };

        function RemsTelemetryModelProvider(adapter){

            function isRelevant(id) {
                return id.indexOf(PREFIX) === 0;
            }

            function makeId(element){
                return PREFIX + element.identifier;
            }

            function buildTaxonomy(dictionary){
                var models = {};

                function addMeasurement(measurement){
                    var format = FORMAT_MAPPINGS[measurement.type];
                    models[makeId(measurement)] = {
                        type: "msl.measurement",
                        name: measurement.name,
                        telemetry: {
                            key: measurement.identifier,
                            ranges: [{
                                key: "value",
                                name: measurement.units,
                                units: measurement.units,
                                format: format
                            }]
                        }
                    };
                }

                function addInstrument(subsystem) {
                    var measurements = (subsystem.measurements || []);
                    models[makeId(subsystem)] = {
                        type: "msl.instrument",
                        name: subsystem.name,
                        composition: measurements.map(makeId)
                    };
                    measurements.forEach(addMeasurement);
                }

                (dictionary.instruments || []).forEach(addInstrument);
                return models;
            }

            return {
                getModels: function (ids) {
                    return ids.some(isRelevant) ? buildTaxonomy(adapter.dictionary) : {};
                }
            };
        }
        return RemsTelemetryModelProvider;
    }
);
