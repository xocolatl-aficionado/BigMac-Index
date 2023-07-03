var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* CurrencyValuation.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "CurrencyValuation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (63:4) {#each countries as country}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*country*/ ctx[13].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*country*/ ctx[13];
    			option.value = option.__value;
    			add_location(option, file, 63, 6, 1884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*countries*/ 4 && t_value !== (t_value = /*country*/ ctx[13].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*countries*/ 4 && option_value_value !== (option_value_value = /*country*/ ctx[13])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(63:4) {#each countries as country}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#each countries as country}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*country*/ ctx[13].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*country*/ ctx[13];
    			option.value = option.__value;
    			add_location(option, file, 68, 6, 2036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*countries*/ 4 && t_value !== (t_value = /*country*/ ctx[13].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*countries*/ 4 && option_value_value !== (option_value_value = /*country*/ ctx[13])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(68:4) {#each countries as country}",
    		ctx
    	});

    	return block;
    }

    // (74:4) {#if exchangeRate}
    function create_if_block_1(ctx) {
    	let t0;
    	let t1_value = /*calculateValuation*/ ctx[8]() + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			t0 = text("Valuation: ");
    			t1 = text(t1_value);
    			t2 = text("\n      \n      Exchange rate: ");
    			t3 = text(/*exchangeRate*/ ctx[4]);
    			t4 = text("\n      Implied Exchange rate: ");
    			t5 = text(/*impliedExchangeRate*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*exchangeRate*/ 16) set_data_dev(t3, /*exchangeRate*/ ctx[4]);
    			if (dirty & /*impliedExchangeRate*/ 8) set_data_dev(t5, /*impliedExchangeRate*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(74:4) {#if exchangeRate}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#if bigMacPrices}
    function create_if_block(ctx) {
    	let t0;
    	let t1_value = /*selectedCountry1*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5_value = /*selectedCountry1*/ ctx[0].code + "";
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9_value = /*selectedCountry1*/ ctx[0].code + "";
    	let t9;
    	let t10;
    	let t11_value = /*selectedCountry2*/ ctx[1].name + "";
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			t0 = text("A Big Mac bought in ");
    			t1 = text(t1_value);
    			t2 = text(" for ");
    			t3 = text(/*price1*/ ctx[7]);
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = text(" would be valued at ");
    			t7 = text(/*foreignPrice*/ ctx[6]);
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = text(" in ");
    			t11 = text(t11_value);
    			t12 = text("!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, t12, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedCountry1*/ 1 && t1_value !== (t1_value = /*selectedCountry1*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*price1*/ 128) set_data_dev(t3, /*price1*/ ctx[7]);
    			if (dirty & /*selectedCountry1*/ 1 && t5_value !== (t5_value = /*selectedCountry1*/ ctx[0].code + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*foreignPrice*/ 64) set_data_dev(t7, /*foreignPrice*/ ctx[6]);
    			if (dirty & /*selectedCountry1*/ 1 && t9_value !== (t9_value = /*selectedCountry1*/ ctx[0].code + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*selectedCountry2*/ 2 && t11_value !== (t11_value = /*selectedCountry2*/ ctx[1].name + "")) set_data_dev(t11, t11_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(t12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(80:4) {#if bigMacPrices}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let select0;
    	let t2;
    	let select1;
    	let t3;
    	let p;
    	let t4;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*countries*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*countries*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block0 = /*exchangeRate*/ ctx[4] && create_if_block_1(ctx);
    	let if_block1 = /*bigMacPrices*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Big Mac Index Currency Valuation";
    			t1 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			add_location(h1, file, 60, 2, 1762);
    			if (/*selectedCountry1*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[9].call(select0));
    			add_location(select0, file, 61, 2, 1806);
    			if (/*selectedCountry2*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[10].call(select1));
    			add_location(select1, file, 66, 2, 1958);
    			add_location(p, file, 72, 2, 2111);
    			attr_dev(main, "class", "svelte-x7y0gi");
    			add_location(main, file, 59, 0, 1753);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(select0, null);
    				}
    			}

    			select_option(select0, /*selectedCountry1*/ ctx[0], true);
    			append_dev(main, t2);
    			append_dev(main, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select1, null);
    				}
    			}

    			select_option(select1, /*selectedCountry2*/ ctx[1], true);
    			append_dev(main, t3);
    			append_dev(main, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t4);
    			if (if_block1) if_block1.m(p, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[9]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*countries*/ 4) {
    				each_value_1 = /*countries*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedCountry1, countries*/ 5) {
    				select_option(select0, /*selectedCountry1*/ ctx[0]);
    			}

    			if (dirty & /*countries*/ 4) {
    				each_value = /*countries*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedCountry2, countries*/ 6) {
    				select_option(select1, /*selectedCountry2*/ ctx[1]);
    			}

    			if (/*exchangeRate*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(p, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*bigMacPrices*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(p, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CurrencyValuation', slots, []);
    	let { countries } = $$props;
    	let { selectedCountry1 } = $$props;
    	let { selectedCountry2 } = $$props;
    	let impliedExchangeRate;
    	let exchangeRate;
    	let bigMacPrices;
    	let foreignPrice;
    	let price1;
    	let price2;

    	async function fetchExchangeRate() {
    		const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectedCountry1.code}`);
    		const data = await response.json();
    		$$invalidate(4, exchangeRate = data.rates[selectedCountry2.code]);

    		// const bigMacResponse = await fetch('https://api.example.com/bigmacindex');
    		// const bigMacData = await bigMacResponse.json();
    		$$invalidate(5, bigMacPrices = {
    			"CAD": 6.77,
    			"CNY": 24,
    			"INR": 191,
    			"USD": 5.15,
    			"EUR": 4.65
    		}); //hardcoded
    	}

    	function calculateValuation() {
    		if (!exchangeRate) return "";
    		console.log("selectedCountry2.code: " + selectedCountry2.code);
    		$$invalidate(7, price1 = bigMacPrices[selectedCountry1.code]);
    		price2 = bigMacPrices[selectedCountry2.code];

    		if (price1 && price2) {
    			$$invalidate(3, impliedExchangeRate = price2 / price1);
    			console.log("implied: " + impliedExchangeRate);
    			console.log("real: " + exchangeRate);
    			$$invalidate(6, foreignPrice = price2 / exchangeRate);

    			if (impliedExchangeRate > exchangeRate) {
    				return `${selectedCountry2.code} is overvalued relative to ${selectedCountry1.code}`;
    			} else if (impliedExchangeRate < exchangeRate) {
    				return `${selectedCountry2.code} is undervalued relative to ${selectedCountry1.code}`;
    			} else {
    				return `${selectedCountry2.code} is fairly valued relative to ${selectedCountry1.code}`;
    			}
    		} else {
    			return "";
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (countries === undefined && !('countries' in $$props || $$self.$$.bound[$$self.$$.props['countries']])) {
    			console_1.warn("<CurrencyValuation> was created without expected prop 'countries'");
    		}

    		if (selectedCountry1 === undefined && !('selectedCountry1' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry1']])) {
    			console_1.warn("<CurrencyValuation> was created without expected prop 'selectedCountry1'");
    		}

    		if (selectedCountry2 === undefined && !('selectedCountry2' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry2']])) {
    			console_1.warn("<CurrencyValuation> was created without expected prop 'selectedCountry2'");
    		}
    	});

    	const writable_props = ['countries', 'selectedCountry1', 'selectedCountry2'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<CurrencyValuation> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selectedCountry1 = select_value(this);
    		$$invalidate(0, selectedCountry1);
    		$$invalidate(2, countries);
    	}

    	function select1_change_handler() {
    		selectedCountry2 = select_value(this);
    		$$invalidate(1, selectedCountry2);
    		$$invalidate(2, countries);
    	}

    	$$self.$$set = $$props => {
    		if ('countries' in $$props) $$invalidate(2, countries = $$props.countries);
    		if ('selectedCountry1' in $$props) $$invalidate(0, selectedCountry1 = $$props.selectedCountry1);
    		if ('selectedCountry2' in $$props) $$invalidate(1, selectedCountry2 = $$props.selectedCountry2);
    	};

    	$$self.$capture_state = () => ({
    		countries,
    		selectedCountry1,
    		selectedCountry2,
    		impliedExchangeRate,
    		exchangeRate,
    		bigMacPrices,
    		foreignPrice,
    		price1,
    		price2,
    		fetchExchangeRate,
    		calculateValuation
    	});

    	$$self.$inject_state = $$props => {
    		if ('countries' in $$props) $$invalidate(2, countries = $$props.countries);
    		if ('selectedCountry1' in $$props) $$invalidate(0, selectedCountry1 = $$props.selectedCountry1);
    		if ('selectedCountry2' in $$props) $$invalidate(1, selectedCountry2 = $$props.selectedCountry2);
    		if ('impliedExchangeRate' in $$props) $$invalidate(3, impliedExchangeRate = $$props.impliedExchangeRate);
    		if ('exchangeRate' in $$props) $$invalidate(4, exchangeRate = $$props.exchangeRate);
    		if ('bigMacPrices' in $$props) $$invalidate(5, bigMacPrices = $$props.bigMacPrices);
    		if ('foreignPrice' in $$props) $$invalidate(6, foreignPrice = $$props.foreignPrice);
    		if ('price1' in $$props) $$invalidate(7, price1 = $$props.price1);
    		if ('price2' in $$props) price2 = $$props.price2;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedCountry1, selectedCountry2*/ 3) {
    			 {
    				if (selectedCountry1 || selectedCountry2) {
    					fetchExchangeRate().then(rate => {
    						$$invalidate(4, exchangeRate = rate);
    						calculateValuation();
    					});
    				}
    			}
    		}
    	};

    	return [
    		selectedCountry1,
    		selectedCountry2,
    		countries,
    		impliedExchangeRate,
    		exchangeRate,
    		bigMacPrices,
    		foreignPrice,
    		price1,
    		calculateValuation,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class CurrencyValuation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			countries: 2,
    			selectedCountry1: 0,
    			selectedCountry2: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CurrencyValuation",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get countries() {
    		throw new Error("<CurrencyValuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set countries(value) {
    		throw new Error("<CurrencyValuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedCountry1() {
    		throw new Error("<CurrencyValuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedCountry1(value) {
    		throw new Error("<CurrencyValuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedCountry2() {
    		throw new Error("<CurrencyValuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedCountry2(value) {
    		throw new Error("<CurrencyValuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* App.svelte generated by Svelte v3.59.2 */

    function create_fragment$1(ctx) {
    	let currencyvaluation;
    	let current;

    	currencyvaluation = new CurrencyValuation({
    			props: {
    				countries: /*countries*/ ctx[0],
    				selectedCountry1: undefined,
    				selectedCountry2: undefined
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(currencyvaluation.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(currencyvaluation, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(currencyvaluation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(currencyvaluation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(currencyvaluation, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const countries = [
    		{ name: "United States", code: "USD" },
    		{ name: "Eurozone", code: "EUR" },
    		{ name: "India", code: "INR" },
    		{ name: "China", code: "CNY" },
    		{ name: "Canada", code: "CAD" }
    	]; // Add more countries as needed

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CurrencyValuation, countries });
    	return [countries];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
