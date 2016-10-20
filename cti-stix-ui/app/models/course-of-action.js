import DS from "ember-data";
import Ember from "ember";

/**
 * Course of Action Model
 * 
 * @module
 * @extends ember-data/Model
 */
export default DS.Model.extend({
    name: DS.attr("string"),
    description: DS.attr(),
    labels: DS.attr(),
    external_references: DS.attr(),
    version: DS.attr("string"),
    created: DS.attr("string"),
    modified: DS.attr("string"),
    type: Ember.computed("id", function() {
        return "course-of-action";
    })
});
