import argparse
import json

def merge(basejson, newjson):

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

# Parse arguments
args = parser.parse_args()
# Execute selection
if args.merge:
    merge(args.merge[0], args.merge[1])

if args.split:
    split(args.split[0])

if args.forge:
    forge(args.forge[0], args.forge[1])