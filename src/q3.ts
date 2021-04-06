import {
  ClassExp,
  ProcExp,
  Exp,
  Program,
  CExp,
  makeProcExp,
  makeVarDecl,
  makeIfExp,
  makeBoolExp,
  Binding,
  makePrimOp,
  makeAppExp,
  isCExp,
  isDefineExp,
  makeDefineExp,
  isAtomicExp,
  isLitExp,
  isIfExp,
  isAppExp,
  makeVarRef,
  isProcExp,
  isExp,
  isProgram,
  makeProgram,
  makeLetExp,
  isClassExp,
  isLetExp,
  makeBinding,
} from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import * as R from "ramda";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>
  makeProcExp(exp.fields, [
    makeProcExp([makeVarDecl("msg")], [makeBody(exp.methods)]),
  ]);

const makeBody = (binding: Binding[]): CExp => {
  if (binding.length === 0) return makeBoolExp(false);
  const var_name = "'" + binding[0].var.var;
  return makeIfExp(
    makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeVarRef(var_name)]),
    makeAppExp(binding[0].val, []),
    makeBody(R.tail(binding))
  );
};

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
  makeOk(
    isExp(exp)
      ? rewriteAllClassExp(exp)
      : isProgram(exp)
      ? makeProgram(R.map(rewriteAllClassExp, exp.exps))
      : exp
  );

const rewriteAllClassExp = (exp: Exp): Exp =>
  isCExp(exp)
    ? rewriteAllClassCExp(exp)
    : isDefineExp(exp)
    ? makeDefineExp(exp.var, rewriteAllClassCExp(exp.val))
    : exp;

const rewriteAllClassCExp = (exp: CExp): CExp =>
  isAtomicExp(exp)
    ? exp
    : isLitExp(exp)
    ? exp
    : isIfExp(exp)
    ? makeIfExp(
        rewriteAllClassCExp(exp.test),
        rewriteAllClassCExp(exp.then),
        rewriteAllClassCExp(exp.then)
      )
    : isAppExp(exp)
    ? makeAppExp(
        rewriteAllClassCExp(exp.rator),
        R.map(rewriteAllClassCExp, exp.rands)
      )
    : isProcExp(exp)
    ? makeProcExp(exp.args, R.map(rewriteAllClassCExp, exp.body))
    : isLetExp(exp)
    ? makeLetExp(
        R.map(
          (bind) => makeBinding(bind.var.var, rewriteAllClassCExp(bind.val)),
          exp.bindings
        ),
        R.map(rewriteAllClassCExp, exp.body)
      )
    : isClassExp(exp)
    ? rewriteAllClassCExp(class2proc(exp))
    : exp;
