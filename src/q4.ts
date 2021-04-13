import {
  closureToString,
  compoundSExpToString,
  isClosure,
  isCompoundSExp,
  isEmptySExp,
  isSymbolSExp,
  Value,
} from "../imp/L3-value";
import {
  Exp,
  Program,
  DefineExp,
  VarDecl,
  AppExp,
  IfExp,
  ProcExp,
  isBoolExp,
  isNumExp,
  isStrExp,
  isVarRef,
  isProcExp,
  isIfExp,
  isAppExp,
  isPrimOp,
  isDefineExp,
  isProgram,
  isLitExp,
  isLetExp,
} from "../imp/L3-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { map} from "ramda";
import { isNumber, isString } from "../shared/type-predicates";

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string> =>
  makeOk(unparseToPython(exp));

const unparseToPython = (exp: Program | Exp): string =>
  isBoolExp(exp)
    ? valueToString(exp.val)
    : isNumExp(exp)
    ? valueToString(exp.val)
    : isStrExp(exp)
    ? valueToString(exp.val)
    : isLitExp(exp)
    ? ""
    : isVarRef(exp)
    ? exp.var
    : isProcExp(exp)
    ? unparseProcExp(exp)
    : isIfExp(exp)
    ? unparseIfExp(exp)
    : isAppExp(exp)
    ? unparseAppExp(exp)
    : isPrimOp(exp)
    ? unparsePrimeOp(exp.op)
    : isLetExp(exp)
    ? ""
    : isDefineExp(exp)
    ? unparseDefineExp(exp)
    : isProgram(exp)
    ? unparseLExps(exp.exps)
    : exp;

const unparseLExps = (les: Exp[]): string =>
  map(unparseToPython, les).join("\n");

const unparseProcExp = (pe: ProcExp): string =>
  `(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${unparseLExps(
    pe.body
  )})`;

const unparseAppExp = (app: AppExp): string =>
  isPrimOp(app.rator)
    ? app.rator.op === "not"
      ? `(not ${map(unparseToPython, app.rands).join(" ")})`
      : `(${map(unparseToPython, app.rands).join(
          " " + unparseToPython(app.rator) + " "
        )})`
    : `${unparseToPython(app.rator)}(${app.rands
        .map((val) => unparseToPython(val))
        .join(",")})`;

const unparseIfExp = (ifex: IfExp): string =>
  `(${unparseToPython(ifex.then)} if ${unparseToPython(
    ifex.test
  )} else ${unparseToPython(ifex.alt)})`;

const unparseDefineExp = (defExp: DefineExp): string =>
  `${defExp.var.var} = ${unparseToPython(defExp.val)}`;

const unparsePrimeOp = (op: string): string =>
  op === "="
    ? "=="
    : op === "boolean?"
    ? "(lambda x : (type(x) == bool)"
    : op === "number?"
    ? "(lambda x: (type(x)== int or type(x)==float)"
    : op === "eq?"
    ? "=="
    : op;

const valueToString = (val: Value): string =>
  isNumber(val)
    ? val.toString()
    : val === true
    ? "True"
    : val === false
    ? "False"
    : isString(val)
    ? `"${val}"`
    : isClosure(val)
    ? closureToString(val)
    : isPrimOp(val)
    ? val.op
    : isSymbolSExp(val)
    ? val.val
    : isEmptySExp(val)
    ? "[]"
    : isCompoundSExp(val)
    ? compoundSExpToString(val)
    : val;
