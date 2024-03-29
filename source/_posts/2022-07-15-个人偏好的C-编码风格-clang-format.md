---
title: 个人偏好的C++编码风格(.clang-format)
tags:
  - C++
  - 编码风格
  - Clang-Format
  - Snippet
categories:
  - - C++
    - 编码风格
  - - Clang-Format
    - C++
date: 2022-07-15 16:02:49
---

```yaml
Language: Cpp
Standard: Cpp11
UseTab: Never
TabWidth: 4
IndentWidth: 4
AccessModifierOffset: -4
# AccessModifierOffset: 2
AlignAfterOpenBracket: Align
AlignConsecutiveAssignments: true
# AlignConsecutiveBitFields: false
AlignConsecutiveDeclarations: true
# AlignConsecutiveMacros: false
AlignEscapedNewlines: Right
# AlignOperands: AlignAfterOperator
AlignTrailingComments: true
# AllowAllArgumentsOnNextLine: false
# AllowAllConstructorInitializersOnNextLine: false
AllowAllParametersOfDeclarationOnNextLine: true
AllowShortBlocksOnASingleLine: false
AllowShortCaseLabelsOnASingleLine: false
# AllowShortEnumsOnASingleLine: true
AllowShortFunctionsOnASingleLine: All
AllowShortIfStatementsOnASingleLine: true
# AllowShortLambdasOnASingleLine: Empty
AllowShortLoopsOnASingleLine: false
AlwaysBreakAfterReturnType: None
AlwaysBreakBeforeMultilineStrings: false
AlwaysBreakTemplateDeclarations: true
BinPackArguments: true
BinPackParameters: true
# BitFieldColonSpacing: Both
BreakBeforeBraces: Custom # Allman
BraceWrapping:
  # AfterCaseLabel: true
  AfterClass: true
  AfterControlStatement: false
  AfterEnum: true
  AfterFunction: true
  AfterNamespace: false
  AfterStruct: true
  AfterUnion: true
  AfterExternBlock: false
  BeforeCatch: true
  BeforeElse: true
  # BeforeLambdaBody: false
  # BeforeWhile: false
  SplitEmptyFunction: false
  SplitEmptyRecord: false
  SplitEmptyNamespace: false
BreakBeforeTernaryOperators: true
BreakConstructorInitializers: BeforeComma
BreakStringLiterals: false
ColumnLimit: 120
CompactNamespaces: false
ConstructorInitializerIndentWidth: 2
Cpp11BracedListStyle: true
PointerAlignment: Left
FixNamespaceComments: true
IncludeBlocks: Preserve
# IndentCaseBlocks: false
IndentCaseLabels: true
# IndentGotoLabels: false
# IndentPPDirectives: BeforeHash
KeepEmptyLinesAtTheStartOfBlocks: false
MaxEmptyLinesToKeep: 1
NamespaceIndentation: None
ReflowComments: false
SortIncludes: false
SortUsingDeclarations: true
SpaceAfterCStyleCast: false
# SpaceAfterLogicalNot: false
SpaceAfterTemplateKeyword: false
SpaceBeforeAssignmentOperators: true
# SpaceBeforeCpp11BracedList: false
SpaceBeforeParens: ControlStatements
# SpaceBeforeRangeBasedForLoopColon: true
# SpaceBeforeSquareBrackets: false
# SpaceInEmptyBlock: false
SpaceInEmptyParentheses: false
SpacesBeforeTrailingComments: 2
SpacesInAngles: false
SpacesInCStyleCastParentheses: false
# SpacesInConditionalStatement: false
SpacesInContainerLiterals: false
SpacesInParentheses: false
SpacesInSquareBrackets: false
ContinuationIndentWidth: 4
```

更多风格定制可以参看：[Clang-Format Style Options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)

