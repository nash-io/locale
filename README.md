# Nash platform localization files

This is a open repository for the community to help translate and correct Nash locale files

Locale files are of format JSON and organized as:

```javascript
{
"key": "content"
}
```

Here "key" is the keyword used in the platform code to identify the text and should not be modified. The "content" text is the translation target and is what replaces occurences of "key" in the code. There are some coding specifics in certain keys, those are indentified by `{{}}` and should be kept as they are, only its textual content should be translated.

Never used Github? This is the easiest way to contribute:
https://www.youtube.com/watch?v=5u0I0UX81tI

We have a simple contributions policy, see it [here](./CONTRIBUTING.md)

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
