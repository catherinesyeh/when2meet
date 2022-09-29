// save some variables
const left_sched = $("#left-cal"); // left main content
const user_grid = document.getElementById("user-grid"); // get user and group grids
const group_grid = document.getElementById("group-grid");

const left_label = $("#left-label"); // labels for group color scale
const right_label = $("#right-label");
const color_key = document.getElementById("colors"); // color scale

const num_cols = 5; // number of days in schedule
const num_hours = 8; // number of hours per day
const num_rows = num_hours * 4; // number of 15 min increments

var avail = null; // store status of first block when user selects times
var selectable; // selection object

const people = ["Walter", "Tom", "Maisy"] // fake other users
var num_people = people.length; // how many people currently
const avail_overlay = $("#available-overlay"); // overlay that shows how many people are available
const num_available = $("#num-available");
const avail_list = $("#avail-list"); // list of people who are available at this time block

function generate_grid(grid) {
    // generate blocks for schedule
    for (var i = 0; i < num_cols; i++) {
        for (var j = 0; j < num_rows; j++) {
            const div = document.createElement("div");
            div.classList.add("time-block");
            // generate unique label
            div.setAttribute("label", i + "" + j);
            // assign to correct column
            div.setAttribute("style", "grid-column:" + (i + 1) + ";")
            grid.appendChild(div);
        }
    }
}

function adjust_color(block) {
    // adjust color of block
    num_avail = 0;
    var names = block.attr("names");
    if (names != null && names != "") {
        var num_avail = names.split(",").length;
    }
    // set color of block accordingly
    var style = $(".color-item").eq(num_avail).attr("style");
    var start = style.indexOf(":") + 2;
    var end = style.indexOf(";");
    var color = style.slice(start, end);
    block.css("background-color", color);
}

function recolor_blocks() {
    // recolor all blocks when scale is adjusted
    $("#group-grid .time-block").each(function () {
        adjust_color($(this));
    });
}

function setup_select() {
    // setup selection tool
    // adapted from: https://github.com/lucasmenendez/selection-area
    let config = {
        container: user_grid,
        targets: '.time-block',
        area: 'select-box',
        touchable: true,
        autostart: true,
        callback: selection => {
            for (var i = 0; i < selection.length; i++) {
                // coordinate changes with right grid
                var block = selection[i];
                var label = block.getAttribute("label");
                var group_block = $("#group-grid .time-block[label=" + label + "]");
                var names = group_block.attr("names");

                if (avail) {
                    // if time previously green, turn to red
                    block.classList.remove("selected");
                    if (names != null && names != "" && names.includes("You")) { // remove user from list
                        group_block.attr("names", names.slice(0, -4));

                        // lighten color of just this block
                        adjust_color(group_block);
                    }
                } else {
                    // if time previously red, turn to green
                    block.classList.add("selected");
                    if (names == null || names == "" || !names.includes("You")) { // add user to list
                        if (names != null && names != "") {
                            group_block.attr("names", names + ",You");
                        } else {
                            group_block.attr("names", "You");
                        }
                        if (people.length + 1 != num_people) {
                            // recolor time blocks since more people now!
                            num_people += 1;
                            // add new color
                            const div = document.createElement("div");
                            div.classList.add("color-item");
                            color_key.appendChild(div);

                            generate_colors(); // regenerate colors
                            recolor_blocks(); // recolor all of blocks
                        } else {
                            // otherwise just color this block
                            // darken color of block too
                            adjust_color(group_block);
                        }
                    }
                }
            }
            avail = null;

            if ($("#user-grid .time-block.selected").length == 0) {
                // if no blocks are selected now, readjust scale
                num_people -= 1;
                // remove color
                $(".color-item:last-child").remove();

                generate_colors(); // regenerate colors
                recolor_blocks(); // recolor all of blocks
            }
        }
    }

    return new SelectionArea(config); // return configurated selection area
}

function generate_colors() {
    // fill in color key based on availability and number of people
    var color_items = $(".color-item");

    var opacity = 0;
    var increment = 1.0 / num_people; // how much to turn opacity up for each color square
    color_items.each(function () {
        $(this).css("background-color", "rgba(48, 147, 56, " + opacity + ")");
        opacity += increment; // gradually darken color
    });

    left_label.html("0/" + num_people + " available");
    right_label.html(num_people + "/" + num_people + " available");
}

function fill_in_group_grid() {
    // randomly choose people who are available at each time slot
    $("#group-grid .time-block").each(function () {
        var num_avail = Math.floor(Math.random() * (num_people + 1));
        var avail_set = people.slice(0, num_avail);

        // set color of block accordingly and save people who are available
        var style = $(".color-item").eq(num_avail).attr("style");
        var start = style.indexOf(":") + 2;
        var end = style.indexOf(";");
        var color = style.slice(start, end);
        $(this).css("background-color", color);
        $(this).attr("names", avail_set);
    });
}

function show_available(block) {
    // show availability overlay on hover
    // show list of people who are available on hover
    var avail_set = block.attr("names");
    var num_avail = 0; // default if empty list
    avail_set = avail_set.split(",");
    if (avail_set != "") {
        var num_avail = avail_set.length;
    }

    var avail_html = "";
    for (var i = 0; i < num_avail; i++) {
        avail_html += "<p>" + avail_set[i] + "</p>"
    }

    // update text that appears
    num_available.html(num_avail + "/" + num_people + " Available");
    avail_list.html(avail_html);

    avail_overlay.removeClass("hide");
    left_sched.addClass("hide");
}

// run code once page is loaded
$(document).ready(function () {
    // load grids
    generate_grid(user_grid);
    generate_grid(group_grid);

    // fill in color grid
    generate_colors();

    // fill in group grid 
    fill_in_group_grid();

    selectable = setup_select(); // setup select object

    $('.time-block').mousedown(function () {
        // base selection pattern on first time block clicked
        // (e.g., if green, turn all selected to pink, and vice versa)
        if (avail == null) {
            avail = $(this).hasClass("selected");
        }
    })

    $('#group-grid .time-block').hover(function () {
        // show availability overlay on hover
        show_available($(this));
    })

    $('#group-grid').mouseout(function () {
        // hide availability over on mouse out
        avail_overlay.addClass("hide");
        left_sched.removeClass("hide");
    })
});