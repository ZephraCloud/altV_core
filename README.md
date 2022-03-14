# altV_core
[![Crowdin](https://badges.crowdin.net/zephra-altv/localized.svg)](https://crowdin.com/project/zephra-altv)

## Config
```json
{
    "sql": {
        "host": "YOUR_SQL_HOST",
        "user": "YOUR_SQL_USER",
        "password": "YOUR_SQL_PASSWORD",
        "database": "YOUR_SQL_DATABASE"
    },
    "autostart": {
        "exclude": []
    },
    "vehicleSpawnBlacklist": [
        "oppressor",
        "oppressor2"
    ],
    "language": "en_US"
}
```

## Menu example
```js
createMenu("Would you like to continue?", [
    {
        label: "Yes {fa-solid fa-check}",
        type: "button",
        action: "close"
    },
    {
        label: "No {fa-solid fa-xmark}",
        type: "button",
        action: "close"
    }
]);
```

## Credits
* [Stuyk](https://github.com/Stuyk) for the great documentation
* [Colin Mitchell](https://muffinlabs.com) for the name generator
* [YannBCF](https://github.com/YannBCF)
