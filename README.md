# clock-analogue
A simple no dependency analogue clock

[Demo](https://codepen.io/elcinverlaat/full/Jjzmzjr)

## Example Usage

```html
<script type="text/javascript" src="clock-analogue.js"></script>

<clock-analogue></clock-analogue>
```

## Options
```html
<clock-analogue 
  size=300 
  background="#00cc00" 
  hourMarkers="roman"
  showSeconds="true"
  snap="true"
>
</clock-analogue>
```

- **size** _int_ Size in pixels.
- **background** _string_ring Color for background (clock face) of clock.
- **showSeconds** _boolean_ Show seconds hand.
- **snap** _boolean_ When snap is true the hands of the clock "snap" to the rounded values on the clock. While snap is false the hands drift between values.
- **hourMarkers** __string__ Comma seperated hour markers. Set to "none" for no hour makers. There are also 4 templates available; "roman", "romanMinimal", "numeral", "numeralMinimal". Example template: "1,2,III,4,5,IV,7,8,IX,9,10,XII"
- **fontFamily** __string__ Font family used by clock.
