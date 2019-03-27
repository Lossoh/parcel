// @flow

import assert from 'assert';

import config from '../';
import packageJson from '../package.json';

describe('@parcel/config-default', () => {
  let packageJsonDependencyNames: Set<string>;
  let configPackageReferences: Set<string>;

  before(() => {
    packageJsonDependencyNames = new Set(
      Object.keys(packageJson.dependencies || {})
    );
    configPackageReferences = collectConfigPackageReferences(config);
  });

  describe('package.json', () => {
    it('includes every package referenced in the config', () => {
      let missingReferences = [];
      for (let reference of configPackageReferences) {
        if (!packageJsonDependencyNames.has(reference)) {
          missingReferences.push(reference);
        }
      }

      assert.deepEqual(missingReferences, []);
    });

    it('does not include packages not referenced in the config', () => {
      let unnecessaryDependencies = [];
      for (let dependency of packageJsonDependencyNames) {
        if (!configPackageReferences.has(dependency)) {
          unnecessaryDependencies.push(dependency);
        }
      }

      assert.deepEqual(unnecessaryDependencies, []);
    });
  });
});

function collectConfigPackageReferences(
  configJson: mixed,
  references: Set<string> = new Set()
): Set<string> {
  for (let value of Object.values(configJson)) {
    if (typeof value === 'string') {
      references.add(value);
    } else if (Array.isArray(value) || isPlainObject(value)) {
      collectConfigPackageReferences(value, references);
    } else {
      throw new Error(
        'Parcel configs must contain only strings, arrays, or objects in value positions'
      );
    }
  }

  return references;
}

function isPlainObject(maybeObj: any): boolean {
  return maybeObj != null && maybeObj.constructor === Object;
}
