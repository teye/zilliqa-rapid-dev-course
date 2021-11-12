import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Scilla',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Scilla is the smart contract language in Zilliqa.<br/>Learn more about Maps, Events, Errors, Custom ADTs and Remote State Reads.
      </>
    ),
  },
  {
    title: 'ZilliqaJS',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        ZilliqaJS is a Javascript library which cotains various functions to interact with the Zilliqa blockchain.
        <br/> 
        Learn how to fetch contract state and invoke transitions.
      </>
    ),
  },
  {
    title: 'React DApp Development',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Combining the knowledge of Scilla and ZilliqaJS, understand how everything links together when developing a frontend framework.
        <br/>
        Learn how to fetch contract state and render on UI and invoke transitions via buttons.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
