const user_grid = document.getElementById("user-grid"); // get user grid
const jq_grid = $("#user-grid"); // jquery version

const num_cols = 5; // number of days in schedule
const num_hours = 8; // number of hours per day
const num_rows = num_hours * 4; // number of 15 min increments

var avail = true;
var selectable;

function generate_grid() {
    // generate blocks for schedule
    for (var i = 0; i < num_cols; i++) {
        for (var j = 0; j < num_rows; j++) {
            const div = document.createElement("div");
            div.classList.add("time-block");
            // generate unique label
            div.setAttribute("label", i + "" + j);
            // assign to correct column
            div.setAttribute("style", "grid-column:" + (i + 1) + ";")
            user_grid.appendChild(div);
        }
    }
}

function setup_select() {
    // setup selection tool
    // adapted from: https://github.com/lucasmenendez/selection-area
    let config = {
        container: document.querySelector('.grid'),
        targets: '.time-block',
        touchable: true,
        autostart: true,
        callback: selection => {
            if (selection.length > 0) {
                // make sure at least 1 item is selected
                avail = selection[0].classList.contains("selected");

            }
            console.log(selectable.selected);
            for (var i = 0; i < selection.length; i++) {
                if (avail) {
                    // if time previously green, turn to red
                    selection[i].classList.remove("selected");
                } else {
                    // if time previously red, turn to green
                    selection[i].classList.add("selected");
                }
            }
        }
    }

    return new SelectionArea(config); // return configurated selection area
}

// run code once page is loaded
$(document).ready(function () {
    generate_grid();

    selectable = setup_select();

    // jq_grid.mousedown(function () {
    //     $(this).addClass("selecting");
    // });

    // jq_grid.mouseup(function () {
    //     $(this).removeClass("selecting");
    //     avail = null;
    // });

    // $('.time-block').mouseover(function () {
    //     if (jq_grid.hasClass("selecting")) {
    //         if (avail) {
    //             $(this).removeClass("selected");
    //         } else {
    //             $(this).addClass("selected");
    //         }
    //     }
    // });
});