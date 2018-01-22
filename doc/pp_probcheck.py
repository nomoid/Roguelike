# pp_probcheck.py
#
# Python script for checking the probability of success in skill checks
#
# For example, a dagger rolls a 3d4 and takes the highest two dice
# The roll requires 4 to be a minor failure (instead of a major failure)
# The roll requires a 6 to be a minor success
# The roll requires a 8 to be a major success
#
# Input:
# probcheck(3,4,2,[4,6,8])
#
# Output:
# 2-3: 4/64 (0.0625)
# 4-5: 19/64 (0.296875)
# 6-7: 31/64 (0.484375)
# 8-8: 10/64 (0.15625)

def probcheck(numdice, diceval, picks, thresholds=None):
    if picks > numdice:
        print('picks (', picks, ') cannot be creater than numdice (', numdice, ')', sep='')
        return
    counts = probcheck1(numdice, diceval, picks, thresholds, [])
    totalcount = len(counts)
    if thresholds == None:
        counts.sort()
        prevnum = -1
        prevcount = 0
        for num in counts:
            if num != prevnum:
                if prevnum >= 0:
                    print(prevnum, ': ', prevcount, '/', totalcount, ' (', prevcount/totalcount, ')', sep='')
                prevcount = 1
                prevnum = num
            else:
                prevcount += 1
        print(prevnum, ': ', prevcount, '/', totalcount, ' (', prevcount/totalcount, ')', sep='')
    else:
        divisions = len(thresholds) + 1
        countkeeper = [0] * divisions
        for num in counts:
            bucket = 0
            for i in range(divisions - 1):
                if num >= thresholds[i]:
                    bucket += 1
                else:
                    break
            countkeeper[bucket] += 1
        for i in range(divisions):
            threshstart = min(counts)
            if i > 0:
                threshstart = thresholds[i-1]
            threshend = max(counts)
            if i < len(thresholds):
                threshend = thresholds[i] - 1
            print('* ', threshstart, '-', threshend, ': ', countkeeper[i], '/', totalcount, ' (', countkeeper[i]/totalcount, ')', sep='')  
    
def probcheck1(numdice, diceval, picks, thresholds, gen=[]):
    if numdice == 0:
        gen.sort()
        return [sum(gen[-picks:])]
    counts = []
    for i in range(diceval):
        gen1 = list(gen)
        gen1.append(i + 1)
        counts += probcheck1(numdice-1, diceval, picks, thresholds, gen1)
    return counts
