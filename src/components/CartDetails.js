import React, { Component } from 'react';
import events from '../vendor/pub-sub';
import _ from 'lodash/object';
import moltin from '../vendor/moltin';
import LoadingIcon from '../../public/ripple.svg';
import {Link} from 'react-router-dom';

export default class CartDetails extends React.Component {
	state = {
		currentCart : {
			total_items: 0,
			contents: {},
			totals : {
				post_discount : {
					formatted : {
						with_tax: null
					}
 				}
			}
		},
		loaded: false,
		removing: false
	};

	componentDidMount() {
		let _this = this;
		moltin.Authenticate(function () {
			moltin.Cart.Contents(function(items) {
				events.publish('CART_UPDATED', {
					cart: items // any argument
				});

				_this.setState({
					currentCart: items,
					loaded: true
				})
			}, function(error) {
				// Something went wrong...
			});
		});
	}

	removeFromCart(clicked) {
		let _this = this;
		this.setState({
			removing: true
		});

		moltin.Authenticate(function () {
			moltin.Cart.Remove(clicked, function() {
				moltin.Cart.Contents(function(items) {
					events.publish('CART_UPDATED', {
						cart: items // any argument
					});

					_this.setState({
						currentCart: items,
						loaded: true,
						removing: false
					})
				}, function(error) {
					// Something went wrong...
				});

				console.log('item removed', clicked)
			}, function(error) {
				// Something went wrong...
			});
		});
	}

	render() {
		let preparedCartContent;
		let cartContent = _.values(this.state.currentCart.contents);
		console.log(this.state.currentCart);

		// If the cart is not empty, display the cart items
		if (this.state.currentCart.total_items >= 1) {
			preparedCartContent = cartContent.map((result, id) => {
				return(
					<div className="item" key={id}>
						<div className="ui tiny image">
							{
								(result.featured_small)
									// If we have an image set
									? <img src={result.featured_small.data.url.https} />

									//else put some placeholder
									: <img src="http://placehold.it/300x380" />
							}
						</div>
						<div className="content">
							<Link to={`/product/${result.id}`}>
								<span className="header">{result.name} <br/>
								<span className="price">{result.pricing.formatted.with_tax}</span>
							</span>
							</Link>
						</div>

						<button  onClick={() => { this.removeFromCart(result.id)}} className={`remove ui button ${this.state.removing ? 'disabled' : ''}`}>
							<i className="remove outline icon"></i></button>
					</div>
				)
			});
		}

		// If the cart is empty, display the message
		else {
			preparedCartContent = (
				<span className="empty">
					The Cart is empty
				</span>
			);
		}

		return (
			<div className="cart-details">
				<div className={`overlay ${this.state.loaded ? 'non-visible' : ''}`}>
					<img src={LoadingIcon} alt="Loading"/>
				</div>

				<div className="ui items">
					{preparedCartContent}

					<div className="total">
						<span className="text">TOTAL: </span>
						<span className="price">{this.state.currentCart.totals.post_discount.formatted.with_tax}</span>
					</div>
				</div>
			</div>
		);
	}
}
