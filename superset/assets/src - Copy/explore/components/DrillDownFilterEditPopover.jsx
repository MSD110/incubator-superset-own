/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Tab, Tabs } from 'react-bootstrap';

import columnType from '../propTypes/columnType';
import adhocMetricType from '../propTypes/adhocMetricType';
import AdhocFilter, { EXPRESSION_TYPES } from '../AdhocFilter';
import DrillDownFilterEditPopoverSimpleTabContent from './DrillDownFilterEditPopoverSimpleTabContent';

const propTypes = {
  adhocFilter: PropTypes.instanceOf(AdhocFilter).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    columnType,
    PropTypes.shape({ saved_metric_name: PropTypes.string.isRequired }),
    adhocMetricType,
  ])).isRequired,
  datasource: PropTypes.object,
};

const startingWidth = 300;
const startingHeight = 260;

export default class DrillDownFilterEditPopover extends React.Component {
  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.onDragDown = this.onDragDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onAdhocFilterChange = this.onAdhocFilterChange.bind(this);
    this.onDrillDownFilterChange = this.onDrillDownFilterChange.bind(this);
    this.adjustHeight = this.adjustHeight.bind(this);

    let aFilter = {...this.props.adhocFilter};
    const aFilterArr = aFilter.comparator.split(',');
    console.log('aFilterArr', aFilterArr);
    const adhocFilter = this.props.adhocFilter;
    adhocFilter.comparator = aFilterArr && aFilterArr[0];
    const drillDownFilter = this.props.drillDownFilter;
    drillDownFilter.subject = aFilterArr && aFilterArr[1];
    console.log('drillDownFilter', drillDownFilter)
    this.state = {
      // adhocFilter: {...this.props.adhocFilter, comparator: aFilterArr && aFilterArr[0]},
      adhocFilter,
      width: startingWidth,
      height: startingHeight,
      // drillDownFilter: {...this.props.drillDownFilter, subject: aFilterArr && aFilterArr[1]},
      drillDownFilter,
    };
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  onAdhocFilterChange(adhocFilter) {
    this.setState({ adhocFilter });
  }

  onDrillDownFilterChange(drillDownFilter) {
    console.log('onDrillDownFilterChange', drillDownFilter)
    this.setState({ drillDownFilter });
  }

  onSave() {
    const { adhocFilter, drillDownFilter } = this.state;
    console.log('onSave', adhocFilter, drillDownFilter)
    let  filter = {...adhocFilter, comparator: `${adhocFilter && adhocFilter.comparator},${drillDownFilter && drillDownFilter.subject}`}
    console.log('final filter', filter)
    this.props.onChange(filter);
    this.props.onClose();
  }

  onDragDown(e) {
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartWidth = this.state.width;
    this.dragStartHeight = this.state.height;
    document.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(e) {
    this.props.onResize();
    this.setState({
      width: Math.max(this.dragStartWidth + (e.clientX - this.dragStartX), startingWidth),
      height: Math.max(this.dragStartHeight + (e.clientY - this.dragStartY) * 2, startingHeight),
    });
  }

  onMouseUp() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  adjustHeight(heightDifference) {
    this.setState(state => ({ height: state.height + heightDifference }));
  }

  render() {
    const {
      adhocFilter: propsAdhocFilter,
      options,
      onChange,
      onClose,
      onResize,
      datasource,
      ...popoverProps
    } = this.props;

    const { adhocFilter } = this.state;

    const stateIsValid = adhocFilter.isValid();
    const hasUnsavedChanges = !adhocFilter.equals(propsAdhocFilter);

    console.log('adhocFilter', this.state.adhocFilter)
    console.log('drillDownFilter', this.state.drillDownFilter)
    // console.log('adhoc options', this.props.options)
    // console.log('datasource', this.props.datasource)
    return (
      <Popover
        id="filter-edit-popover"
        {...popoverProps}
      >
        <Tabs
          id="adhoc-filter-edit-tabs"
          defaultActiveKey={adhocFilter.expressionType}
          className="adhoc-filter-edit-tabs"
          style={{ height: this.state.height, width: this.state.width }}
        >
          <Tab
            className="adhoc-filter-edit-tab"
            eventKey={EXPRESSION_TYPES.SIMPLE}
            title="Simple"
          >
            <DrillDownFilterEditPopoverSimpleTabContent
              adhocFilter={this.state.adhocFilter}
              drillDownFilter={this.state.drillDownFilter}
              onChange={this.onAdhocFilterChange}
              onDrillDownChange={this.onDrillDownFilterChange}
              options={this.props.options}
              datasource={this.props.datasource}
              onHeightChange={this.adjustHeight}
            />
          </Tab>
        </Tabs>
        <div>
          <Button
            disabled={!stateIsValid}
            bsStyle={(hasUnsavedChanges && stateIsValid) ? 'primary' : 'default'}
            bsSize="small"
            className="m-r-5"
            onClick={this.onSave}
          >
            Save
          </Button>
          <Button bsSize="small" onClick={this.props.onClose}>Close</Button>
          <i onMouseDown={this.onDragDown} className="glyphicon glyphicon-resize-full edit-popover-resize" />
        </div>
      </Popover>
    );
  }
}
DrillDownFilterEditPopover.propTypes = propTypes;
