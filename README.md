# Nash platform localization files

This is an open repository for the community to help translate and correct Nash locale files.

Locale files are in JSON format and organized like this:

```javascript
{
  "key": "content"
}
```

Here "key" is the keyword used in the platform code to identify the text and should not be modified. The "content" text is the translation target and is what replaces occurences of "key" in the code.

There are some coding specifics in certain keys. These indentified by `{{}}`,  e.g. `Hello, {{userName}}!`, and should be kept as they are. Only translate the text around these elements and move them to match appropriate word order in your language.

You will also notice links denoted by numbered tags, e.g. `View your transaction under the <0>Transfers</0> tab.` In this case, you should translate the text within the tags.

## Using GitHub

Never used GitHub? This is the easiest way to contribute:
https://www.youtube.com/watch?v=5u0I0UX81tI

If you are facing issues using GitHub for the first time there is a desktop app that might make your life easier: https://desktop.github.com/

## Tips for contributors

1) Make multiple sets of small changes. Keep your pull requests to 100 lines at most.
2) Always ensure you are making changes against the latest version of the `master` branch.

You can view our simple contributions policy [here](./CONTRIBUTING.md).

## Ask for help!

If you don't understand a phrase in the English file, don't guess! Ask for help. Our writer is available on GitHub as `@lexipenia` and Telegram as `@cstfenwick`, and will be able to clarify issues for you. 

## Locales list

| Locale name | Language           | Country/Territory           |
|-------------|--------------------|-----------------------------|
| [en](./locales/en.json)             | English            | International (US standard) |
| [ar_AA](./locales/ar_AA.json)       | Arabic             | International (AA standard) |
| [bg_BG](./locales/bg_BG.json)       | Bulgarian          | Bulgaria                    |
| [cs_CZ](./locales/cs_CZ.json)       | Czech              | Czech Republic              |
| [da_DK](./locales/da_DK.json)       | Danish             | Denmark                     |
| [de_DE](./locales/de_DE.json)       | German             | International (DE standard) |
| [el_GR](./locales/el_GR.json)       | Greek              | Greece                      |
| [es_ES](./locales/es_ES.json)       | Spanish            | International (ES standard) |
| [fr_FR](./locales/fr_FR.json)       | French             | International (FR standard) |
| [he_IL](./locales/he_IL.json)       | Hebrew             | Israel                      |
| [hi_IN](./locales/hi_IN.json)       | Hindi              | Hindi                       |
| [hr_HR](./locales/hr_HR.json)       | Serbo-Croatian     | International (HR standard) |
| [it_IT](./locales/it_IT.json)       | Italian            | Italy                       |
| [ja_JP](./locales/ja_JP.json)       | Japanese           | Japan                       |
| [ko_KR](./locales/ko_KR.json)       | Korean             | Korea                       |
| [nl_NL](./locales/nl_NL.json)       | Dutch              | Netherlands and Belgium     |
| [pt_BR](./locales/pt_BR.json)       | Portuguese         | International (BR standard) |
| [ro_RO](./locales/ro-RO.json)       | Romanian           | Romania                     |
| [ru_RU](./locales/ru_RU.json)       | Russian            | Russia                      |
| [th_TH](./locales/th-TH.json)       | Thai               | Thailand                    |
| [tr_TR](./locales/tr_TR.json)       | Turkish            | Turkey                      |
| [zh_CN](./locales/zh_CN.json)       | Simplified Chinese | International (CN standard) |
