# Simple Navbar

A simple and modern navigation bar for Home Assistant Lovelace dashboards. Creates a navigation bar docked to the top of the screen, for easy navigation between dashboards on wall panels. Lots of options for full customization, clock (time and date) included.

[![GitHub Release][releases-shield]][releases]
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![License][license-shield]](LICENSE.md)

![Image of Simple Navbar Card](https://github.com/sierramike/lovelace-simple-navbar/blob/master/.images/simple-navbar.png?raw=true)

## Options

| Name              | Type    | Requirement  | Description                                 | Default             |
| ----------------- | ------- | ------------ | ------------------------------------------- | ------------------- |
| type              | string  | **Required** | `custom:digital-clock`                      |                     |
| locale            | string  | **Optional** | Locale to use for formatting. For example `de` | locale set in your home assistant profile otherwise your browser locale |
| timeZone          | string  | **Optional** | Time zone to use. For example `Europe/Berlin` | time zone set in your home assistant profile otherwise your browser time zone |
| timeFormat        | string  | **Optional** | Format of time                              | `HH:mm:ss`          |
| dateFormat        | string  | **Optional** | Format of date                              | `cccc d LLLL yyyy`  |
| background        | string  | **Optional** | Background of the card. Can be any valid CSS color (eg. `red`, `#FF0000`, ...) or an url to an image (eg. `url('http://path.to/image.jpg'`) | |
| additionalCSS     | string  | **Optional** | Any additional CSS you wish to add to the card for maximum customization (eg. `border:none`) |  |
| size              | string  | **Optional** | Size of icon and height of text blocs       | 32px                |
| fontSize          | string  | **Optional** | Font size of the single line text. Will render as `font-size` CSS property. | `large` |
| items             | array of objects `SimpleNavbarItem` (see below) | **Required** | List of tabs displayed in the navigation bar | |

For `timeFormat` and `dateFormat`, it can be every format, which is valid in Luxon.
See: [https://moment.github.io/luxon/#/formatting?id=toformat](https://moment.github.io/luxon/#/formatting?id=toformat)

## SimpleNavbarItem object options

| Name              | Type    | Requirement  | Description                                 | Default             |
| ----------------- | ------- | ------------ | ------------------------------------------- | ------------------- |
| selected          | boolean | **Optional** | Set to true to color item with primary theme color | false        |
| type              | string  | **Optional** | Item type (`icon`, `text`, `icon-text`, `label` or `label-2lines`). | `text` |
| icon              | string  | **Optional** | Icon in format `mdi:icon`, can contain template | `mdi:home-assistant` |
| text              | string  | **Optional** | Text for single line items, first line for 2 lines item, can contain template | |
| secondLine        | string  | **Optional** | Text for second line for 2 lines item, can contain template | `2nd line` |
| iconTextSpacing   | string  | **Optional** | Padding between icon and text for `icon-text` type items | `20px` |
| pushToRight       | boolean | **Optional** | Set to true to push item and next items to the right. Set to true to another item to center it (see examples) | false |
| horizontalPadding | string  | **Optional** | Left and right padding of item              | 30px                |
| color             | string  | **Optional** | Text color of item. Can be any valid CSS color value (eg. `red`, `#FF0000`, ...). Will render as `color` CSS property. Can contain template    | grey                |
| fontSize          | string  | **Optional** | Font size of item. Will render as `font-size` CSS property. Can contain template | |
| fontWeight        | string  | **Optional** | Font weight of item (eg. `100`, `200`, ..., `lighter`, `bold`, `normal`, ...). Will render as `font-weight` CSS property. Can contain template | |
| textAlign         | string  | **Optional** | Text alignment (`left`, `center` or `right`). Will render as `text-align` CSS property. Can contain template | `left`            |
| action            | string  | **Optional** | Tap action (`navigate`, `url`, `toggle`, `call-service` or `more-info`) to be executed on tap. | |
| entity            | string  | **Required for toggle and more-info** | Entity to be toggled or to display more info dialog. | |
| navigation_path   | string  | **Required for navigate** | Home Assistant path to navigate to. | |
| url_path          | string  | **Required for url** | Url to navigate to. | |
| url_target        | string  | **Required for url** | Target window to open url. | `_blank` |
| service           | string  | **Required for call-service** | Name of the service to be called | |
| service_data      | string  | **Required for call-service** | Data sent to the called service | |
| additionalCSS     | string  | **Optional** | Any additional CSS you wish to add to the text line for maximum customization (eg.  `text-decoration:underline`) |  |

Leave any option empty or remove it from configuration and it will use default value.

Templates: each option where "can contain template" is written in description can contain a valid entity ID into double brackets to get its value (eg. {{ input_sensor.sensor01 }}), or one of the special values :
- {{ user }} : will render as the logged in user name
- {{ date }} : will render as current date using `dateFormat` option
- {{ time }} : will render as current time using `timeFormat` option

## Item types

### icon

Will render as a single icon. Will show hover effect when mouse hovers only if an action is defined.

### text

Will render as a single line of text. Will show hover effect when mouse hovers only if an action is defined. If text is empty, item will not be rendered.

### icon-text

Will render as an icon followed by single line of text. Will show hover effect when mouse hovers only if an action is defined. If text is empty, item will not be rendered.

### label

Will render as a single line of text, or an icon followed by the text if an icon has been defined. Won't show any hover effet, and can't show as `selected`. Use `color` property to customize color of text. If text is empty, item will not be rendered.

### label-2lines

Will render as two lines of text, use fontSize property to lower the font size until the display suits your needs. Won't show any hover effet, and can't show as `selected`. Use `color` property to customize color of text. If both lines of text are empty, item will not be rendered.


Note: As you understand, empty text will not render the item, even if an icon is set (except for `icon` type which doen't render any text). That means, text can be a template displaying a variable with an icon. If the variable is empty, it will hide the item. See in example below how this can be used to display warning messages.


# Examples

This section shows an example of navigation bar yaml code.

![Image of Simple Navbar Card](https://github.com/sierramike/lovelace-simple-navbar/blob/master/.images/simple-navbar.png?raw=true)

```
type: custom:simple-navbar
size: 32px
fontSize: large
items:
  - type: icon-text
    text: Home
    icon: mdi:home
    selected: true
    action: navigate
    navigation_path: /lovelace/0
  - text: Piscine
    action: navigate
    navigation_path: /lovelace/piscine
  - text: Lumières
    action: navigate
    navigation_path: /lovelace/lumieres
  - text: Toggle
    action: call-service
    service: input_boolean.toggle
    service_data:
      entity_id: input_boolean.tcwsd
  - text: "{{ input_text.headeralert }}"
    icon: mdi:alert
    type: label
    pushToRight: true
    color: red
    fontWeight: bold
  - text: "{{ time }}"
    secondLine: "{{ date }}"
    type: label-2lines
    fontSize: 14px
    fontWeight: bold
    color: black
    textAlign: right
    pushToRight: true
    horizontalPadding: 10px
  - text: "{{ sensor.localtemperature }} °C"
    color: "{{ sensor.tempcolor }}"
  - text: serverIcon
    type: icon
    icon: mdi:server
    horizontalPadding: 10px
  - text: settingsIcon
    type: icon
    icon: mdi:cog
    horizontalPadding: 10px
```

Description:
- 1st item will render as a home icon and "Home" text, show as selected with the primary theme color, and navigate to the first dashboard when clicked.
- 2nd item will render as "Piscine" text, grayed, support hover effect, and navigate to the `piscine` dashboard when clicked.
- 3rd item will render as "Lumières" text, grayed, support hover effect, and navigate to the `lumieres` dashboard when clicked.
- 4th item will render as "Toggle" text, support hover effect, and will toggle `input_boolean.tcwsd` entity when clicked.
- 5th item will render as a red, bold text prefixed with an alert icon, only if `input_text.headeralert` variable contains some text. Can be used to display alert messages that can be set by automations or any other source. Will be centered between first 4 items and the next items, as the 6th item is also pushed to right.
- 6th item will render as a 2 lines label, small bold text, with first line beeing the time and second line the date. Both lignes will align to right.
- 7th item will render as a single label, with no hover effect, display the temperature, and use a template variable `sensor.tempcolor` to set the color depending on the value. (see below for the template variable exemple)
- 8th item will render as a servers icon. Will not support hover effect until an action is set.
- 9th item will render as a settings gear icon. Will not support hover effect until an action is set.

Template variable:
In this example, the temparature will be colored depending on its value, using a sensor template variable that conains the following code:
```
{% set lt = states('sensor.localtemperature') | float %}
{% if lt < 15 %}
  blue
{% elif lt < 22 %}
  green
{% elif lt < 30 %}
  orange
{% else %}
  red
{% endif %}
```

These if statements will return a color name depending on value comparison. Color name can also be any valid HTML color code. The return value is used in the `color` option of the 7th item in the previous example. That demonstrates how easy customization can be.



[license-shield]: https://img.shields.io/github/license/sierramike/lovelace-simple-navbar.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/sierramike/lovelace-simple-navbar.svg?style=for-the-badge
[releases]: https://github.com/sierramike/lovelace-simple-navbar/releases
