#!/usr/bin/env python3
"""Independent exact-rational checks for the symbolic-regression lesson."""
from fractions import Fraction as Q
from itertools import combinations
import json


def solve(a, b):
    rows = [list(row) + [value] for row, value in zip(a, b)]
    n = len(rows)
    for col in range(n):
        pivot = next(i for i in range(col, n) if rows[i][col])
        rows[col], rows[pivot] = rows[pivot], rows[col]
        v = rows[col][col]
        rows[col] = [x / v for x in rows[col]]
        for i in range(n):
            if i != col:
                v = rows[i][col]
                rows[i] = [x - v * y for x, y in zip(rows[i], rows[col])]
    return [row[-1] for row in rows]


def fit(xs, ys, powers):
    a = [[sum(x ** (i + j) for x in xs) for j in powers] for i in powers]
    b = [sum(y * x ** i for x, y in zip(xs, ys)) for i in powers]
    c = solve(a, b)
    return c, sum((sum(v * x ** i for v, i in zip(c, powers)) - y) ** 2 for x, y in zip(xs, ys)) / len(xs)


def interval(m, models):
    lo, hi = Q(0), None
    for other in models:
        d = m['cost'] - other['cost']
        r = other['mse'] - m['mse']
        if d == 0:
            if r < 0:
                return None
        elif d > 0:
            bound = r / d
            hi = bound if hi is None else min(hi, bound)
        else:
            lo = max(lo, r / d)
    return None if hi is not None and hi < lo else (lo, hi)


def lagrange(x, xs, ys):
    total = Q(0)
    for i, (s, y) in enumerate(zip(xs, ys)):
        term = y
        for j, t in enumerate(xs):
            if i != j:
                term *= (x - t) / (s - t)
        total += term
    return total


def truth(x):
    return x*x+x+1


def main():
    xs = [Q(-2) + Q(i, 4) for i in range(17)]
    ys = [truth(x) for x in xs]
    costs = [1, 3, 5]
    models = []
    for mask in range(1, 8):
        powers = [i for i in range(3) if mask & (1 << i)]
        coefs, error = fit(xs, ys, powers)
        models.append({'letter': chr(64 + mask), 'cost': sum(costs[i] for i in powers) + len(powers) - 1, 'mse': error, 'coefs': coefs})
    expected_mse = [Q(105,32), Q(257,32), Q(57,32), Q(167,86), Q(3,2), Q(19,43), Q(0)]
    assert [m['mse'] for m in models] == expected_mse
    frontier = [m['letter'] for m in models if not any(o is not m and o['cost'] <= m['cost'] and o['mse'] <= m['mse'] and (o['cost'] < m['cost'] or o['mse'] < m['mse']) for o in models)]
    assert frontier == list('ACEFG')
    intervals = {m['letter']: interval(m, models) for m in models}
    assert intervals == {'A': (Q(3,8), None), 'B': None, 'C': (Q(1843,5504), Q(3,8)), 'D': None, 'E': None, 'F': (Q(19,86), Q(1843,5504)), 'G': (Q(0), Q(19,86))}
    assert min((m for m in models if m['cost'] <= 7), key=lambda m: m['mse'])['letter'] == 'E'
    assert (models[2]['mse'] - models[4]['mse']) / 2 == Q(9,64)
    assert (models[4]['mse'] - models[5]['mse']) / 2 == Q(91,172)
    clean_x = [Q(-1) + Q(i,4) for i in range(9)]
    assert fit(clean_x, [truth(x) for x in clean_x], [0,1,2])[0] == [1,1,1]
    pattern = [Q(n,10) for n in [4,-8,6,-2,10,-7,3,-10,5]]
    train_y = [truth(x) + Q(1,5)*p for x,p in zip(clean_x, pattern)]
    valid_x = [Q(-1) + Q(2*i+1,40) for i in range(40)]
    extra_x = [Q(1) + Q(i+1,40) for i in range(40)]
    def mse(points, targets):
        return sum((lagrange(x, clean_x, train_y)-y)**2 for x,y in zip(points,targets))/len(points)
    train = mse(clean_x,train_y)
    valid = mse(valid_x,[truth(x) for x in valid_x])
    extra = mse(extra_x,[truth(x) for x in extra_x])
    assert train == 0
    assert abs(float(valid)-0.2353722147053) < 1e-12
    assert abs(float(extra)-8008384.224429) < 1e-5
    out = {'candidates': {m['letter']: {'nodes': m['cost'], 'mse': float(m['mse']), 'interval': None if intervals[m['letter']] is None else [float(v) if v is not None else None for v in intervals[m['letter']]]} for m in models}, 'frontier': frontier, 'budget_7': 'E', 'degree8_mse': {'train': float(train), 'validation': float(valid), 'extrapolation': float(extra)}}
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
