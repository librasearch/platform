/* eslint-disable no-console */
/* eslint-disable react/prefer-stateless-function */
import {  h , Component } from 'preact';
import ReactTable from 'react-table';
import commaNumber from 'comma-number';
import { Link } from 'preact-router/match';
import moment from 'moment';
import axios from 'axios';
import style from './style';

export default class AllTransactionTable extends Component {
	// Query pull function
	pullLatest() {
		axios.get('http://localhost:3000/all')
			.then(response => {
				const result = response.data; // Setup response.data as result variable
				for (let i = 0; i < result.length; i++) {

					// Add mint / p2p option.
					if (result[i].from === '0000000000000000000000000000000000000000000000000000000000000000') {
						result[i].type = 'Mint';
						result[i].from = 'Minting Account';
					}
					else {
						result[i].type = 'P2P';
					}

					// Fix libra value to use top-level units by dividing by a million
					result[i].value = commaNumber(result[i].value/1000000);

					// Prettify date formatting via Moment
					result[i].time = moment.unix(result[i].time).fromNow();
				}
				this.setState({
					latestTransactions: result, // Set latestTransactions to equal resulting data
					latestVersion: commaNumber(result[0]._id)
				});
			}).catch(err => {
				// Catch errors if any
				console.log('Please contact support. There seems to be an error. Error code:' + err);
			});
	}

	// Constructor setup
	constructor() {
		super();

		this.state = {
			latestVersion: 'Loading',
			latestTransactions: [], // Initializing empty latestTransactions array
			tableColumns: [{ Header: 'TX ID',accessor: '_id', Cell: props => <Link href={`/version/${props.value}`}>{props.value}</Link> },{ Header: 'EXPIRATION TIME',accessor: 'time'},{Header: 'TYPE', accessor: 'type'},{ Header: 'FROM',accessor: 'from', Cell: props => <Link href={`/address/${props.value}`}>{props.value}</Link>},{ Header: 'TO',accessor: 'to', Cell: props => <Link href={`/address/${props.value}`}>{props.value}</Link>},{ Header: 'AMOUNT',accessor: 'value', Cell: props => <span>{props.value} <span>LIB</span></span>},{ Header: 'TX FEE',accessor: 'gas_price', Cell: props => <span>{props.value} <span>LIB</span></span> }] // Setting up dynamic table columns
		};

		this.pullLatest = this.pullLatest.bind(this); // Binding this to pullLatest()
	}

	// On mount component update.
	componentDidMount() {
		this.pullLatest; // First pull from '/latest'
		setTimeout(this.pullLatest, 100);
	}

	render() {
		return (
			<div>
				<div class={style.alertBeta}>
					<p>Note: this feature is currently in beta. Thus, it may take upwards of 5 seconds to load all transactions.</p>
				</div>
				<div class={style.alltbl}>
					<div>
						<p>{this.state.latestVersion} transactions found</p>
					</div>
					<ReactTable
						data={this.state.latestTransactions}
						columns={this.state.tableColumns}
						defaultPageSize={25}
						showPageJump={false}
					/>
				</div>
			</div>
		);
	}
}
