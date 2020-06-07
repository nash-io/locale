#!/usr/bin/env python3
import argparse
import json

def casematch(basejson, newjson):
    # This function makes the casing of the first work of each item on basejson
    # be matched on the corresponding entry on newjson.

    debase = json.load(open("./{}".format(basejson)))
    dewip = json.load(open("./{}".format(newjson)))

    def match(lhs, rhs):
        if (len(lhs) == 0) or (not lhs[0].isalpha()): return rhs
        if lhs[0].islower():
            return rhs[0].lower() + rhs[1:]
        else:
            return rhs[0].upper() + rhs[1:]

    def traverse(key, base, wip):
        if key in wip.keys():
            if type(base[key]) is dict:
                for subkey in base[key]:
                    traverse(subkey, base[key], wip[key])
            elif type(base[key]) is list:
                for idx, item in enumerate(base[key]):
                    wip[key][idx] = match(item, wip[key][idx])
            else:
                wip[key] = match(base[key], wip[key])

    for key in debase:
        traverse(key, debase, dewip)

    with open('casematch_{}'.format(newjson), 'w', encoding='utf8') as json_file:
        json.dump(dewip, json_file, ensure_ascii=False, indent=2)

def merge(basejson, newjson):
    # This function replaces the contents of keys in the basejson with content
    # from newjson. It can handle missing keys in newjson.

    debase = json.load(open("./{}".format(basejson)))
    dewip = json.load(open("./{}".format(newjson)))

    def replaceitem(key, base, wip):
        if key in wip.keys():
            if type(base[key]) is dict:
                for subkey in base[key]:
                    replaceitem(subkey, base[key], wip[key])
            else:
                base[key] = wip[key]

    for key in debase:
        replaceitem(key, debase, dewip)

    with open('merge_{}'.format(basejson), 'w', encoding='utf8') as json_file:
        json.dump(debase, json_file, ensure_ascii=False, indent=2)

def split(filejson):
    # This function splits filejson in two files, keys_file.txt and
    # content_file.txt. This makes possible to translate content without
    # having to worry about changes in keys. Order is preserved by line
    # number, so content nor keys entries can change positions.

    debase = json.load(open("./{}".format(filejson)))

    mapping = []
    content = []

    def to_raw(string):
        return fr"{string}".replace('\n', u"\u0402") #This is a simple hack to not lose the newlines on the files

    def mapkeys(key_tuple, base):
        key = key_tuple[-1]
        if type(base[key]) is dict:
            for subkey in base[key]:
                mapkeys(key_tuple + (subkey,), base[key])
        else:
            mapping.append(','.join(key_tuple) + '\n')
            content.append(to_raw(base[key])+'\n')

    for key in debase:
        mapkeys((key,), debase)

    open('keys_{}.txt'.format(filejson.replace('.json', '')), 'w', encoding='utf8').writelines(mapping)
    open('content_{}.txt'.format(filejson.replace('.json', '')), 'w', encoding='utf8').writelines(content)

def forge(keysfile, contentfile):
    # This function is make to work together with split. It receives a keysfile
    # and a contentfile and reconstruct a unified JSON file for use as locale.

    mapping = open(keysfile, 'r').readlines()
    content = open(contentfile, 'r').readlines()

    def setInDict(dataDict, maplist, value):
        first, rest = maplist[0], maplist[1:]

        if rest:
            try:
                if not isinstance(dataDict[first], dict):
                    # if the key is not a dict, then make it a dict
                    dataDict[first] = {}
            except KeyError:
                # if key doesn't exist, create one
                dataDict[first] = {}

            setInDict(dataDict[first], rest, value)
        else:
            dataDict[first] = value

    de = {}
    for idx, line in enumerate(mapping):
        keys = line.strip().split(',')
        setInDict(de, keys, content[idx].strip().replace(u"\u0402", '\n'))

    name = keysfile.replace('keys_', '').replace('.txt', '')
    with open('{}.json'.format(name), 'w', encoding='utf8') as json_file:
        json.dump(de, json_file, ensure_ascii=False, indent=2)

# Define arguments
parser = argparse.ArgumentParser(description='Simple toolbox to manage locale files')
parser.add_argument('-m', '--merge', nargs=2, type=str, help='merge changes from new into base: merge base.json new.json')
parser.add_argument('-s', '--split', nargs=1, type=str, help='split JSON into translation keys and content: split en.json')
parser.add_argument('-f', '--forge', nargs=2, type=str, help='forge JSON from keys and content files: forge keys.txt content.txt')
parser.add_argument('-c', '--case', nargs=2, type=str, help='Match case of leading word in items from ref.json to new.json')

# Parse arguments
args = parser.parse_args()
# Execute selection
if args.merge:
    merge(args.merge[0], args.merge[1])

if args.split:
    split(args.split[0])

if args.forge:
    forge(args.forge[0], args.forge[1])

if args.case:
    casematch(args.case[0], args.case[1])