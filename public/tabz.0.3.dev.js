/****************************************
 TabComponent
**************************************************/
'use strict';

var twCounter = 1;
function TabPanel(o) {
	'use strict';
	var _ = this;
	if (o.target) {
		_.id = twCounter++;
	}
	_.o = o;
	_.deletePanel = function (t) {
		var n, w, at, ap;
		if (t.hasAttribute('role') && t.getAttribute('role') == 'tab') {
			at = t;
			n = t.parentNode;
			w = n.nextSibling;
			ap = w.querySelector(t.hash);
		} else {
			while (t.getAttribute('role') != 'tabpanel') {
				t = t.parentNode;
			}
			ap = t;
			w = t.parentNode;
			n = w.previousSibling;
			at = n.querySelector('[aria-controls=' + ap.id + ']');
		}
		if (ap.hasAttribute('data-deletion')) {
			n.removeChild(at);
			w.removeChild(ap);
			if (at.nextSibling) at.nextSibling.focus();else if (n.firstChild) n.firstChild.focus();else {
				n.parentNode.removeChild(n);
				w.parentNode.removeChild(w);
			}
		}
	};
	_.handleUserEvent = function (e) {
		e = e ? e : arguments[0];
		var t = e.target,
		    kc = e.keyCode,
		    at = (t.hasAttribute('role') && t.getAttribute('role')) === 'tab' ? t : this.previousSibling.querySelector('[aria-selected=true]'),
		    n = at.parentNode,
		    w = n.nextSibling;

		if (e.type === 'focus' && t.hasAttribute('aria-controls') && t.getAttribute('aria-selected') !== 'true') {
			t.removeAttribute('tabindex');
			_.displayTab(t);
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.type === 'keydown') {
			//si le focus est dans la navigation

			if (t.hasAttribute('role') && t.getAttribute('role', 'tab') && e.ctrlKey === false) {

				//left or up or page up
				if (kc === 37 || kc === 38 || kc === 33) {
					if (t.previousSibling) t.previousSibling.focus();else n.lastChild.focus();
				}
				//right or down or page down
				if (kc === 39 || kc === 40 || kc === 34) {
					if (t.nextSibling) t.nextSibling.focus();else n.firstChild.focus();
				}
				if (kc === 36) n.firstChild.focus();
				//quand on tape sur fin, on passe au dernier slide
				if (kc === 35) n.lastChild.focus();
				e.stopPropagation();
			}

			if (e.ctrlKey === true) {
				// ctrl + up / down: remonter le focus a la tab active

				if (kc === 38 || kc === 40) {
					if (t !== at) at.focus();else {
						at = at.parentNode;
						while (at.hasAttribute('role') && at.getAttribute('role') !== 'tabpanel') {
							at = at.parentNode;
						}
						if (at !== document.body) {
							at = at.parentNode.previousSibling.querySelector('[aria-selected=true]');
							at.focus();
						}
					}
				}
				//ctrl + left : prev tab
				if (kc === 37) {
					if (at.previousSibling) at.previousSibling.focus();else at.parentNode.lastChild.focus();
				}
				//ctrl + right : next tab
				if (kc === 39) {
					if (at.nextSibling) at.nextSibling.focus();else at.parentNode.firstChild.focus();
				}
				//peut occasionner un conflit avec les raccourcis navigateur pour changer de tab
				//quand on tape sur ctrl+pageup on passe au slide precedent

				if (kc === 33) {
					if (at.previousSibling) at.previousSibling.focus();else n.lastChild.focus();
				}
				//quand on tape sur ctrl+pagedown on passe au slide suivant
				if (kc === 34) {
					if (at.nextSibling) at.nextSibling.focus();else n.firstChild.focus();
				}
				e.stopPropagation();
			}

			//si l'evenement n'est pas emis depuis les tabs (nav) et que la touche ctrl est activée
		}

		if (e.type === 'click' && t.hasAttribute('data-delPanel') || e.type === 'keyup' && e.altKey && kc == 46) {
			_.deletePanel(t, this);
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.type === 'click' && (t.hasAttribute('role') && t.getAttribute('role') === 'tab' || t.hasAttribute('data-delPanel'))) e.preventDefault();
		e.stopPropagation();
		return false;
	};
	_.displayTab = function (t) {
		var h,
		    p = _.o.prefix,
		    f,
		    i,
		    c,
		    nav = t.parentNode,
		    ap,
		    lp,
		    tp = nav.nextSibling.children,
		    at = nav.querySelectorAll('[role=tab]');

		for (i = 0; i < tp.length; ++i) {
			if (tp[i].getAttribute('aria-selected') === 'true') {
				lp = tp[i];
			} else {
				tp[i].classList.remove('isAnimated');
				tp[i].setAttribute('aria-hidden', true);
				tp[i].setAttribute('aria-selected', false);
			}
		}
		if (t.hasAttribute('aria-selected') && t.getAttribute('aria-selected') !== true) {

			h = t.hash.replace('#', '');
			ap = document.getElementById(h);

			if (at) {
				for (i = 0; i < at.length; i++) {
					c = at[i];
					if (c !== t) {
						at[i].setAttribute('tabindex', '-1');
						at[i].setAttribute('aria-selected', false);
					}
				}
			}

			t.setAttribute('aria-selected', true);
			t.removeAttribute('tabindex');

			if (_.o.anim) {

				for (i = 0; i < tp.length; i++) {
					c = tp[i];
					if (c !== lp && c !== ap) {
						c.classList.remove('isAnimated');
						c.setAttribute('aria-selected', false);
						c.setAttribute('aria-hidden', true);
					}
				}
				//if necessaire pour ie lors des supressions
				if (lp && lp !== ap) {
					lp.classList.add('isAnimated');
					lp.addEventListener(_.o.anim, _.animTimer, true);
				}
				if (ap) {
					ap.classList.add('isAnimated');
					ap.addEventListener(_.o.anim, _.animTimer, true);
				}
			} else if (tp) {
				for (i = 0; i < tp.length; i++) {
					if (tp[i] !== ap) tp[i].setAttribute('aria-hidden', true);
				}
			}
			for (i = 0; i < tp.length; i++) {
				if (tp[i] !== ap) tp[i].setAttribute('aria-selected', false);
			}
			ap.setAttribute('aria-selected', true);
			ap.removeAttribute('aria-hidden');
			if (_.o.secureTabIndex) _.secureTabIndex(lp, true);
			if (_.o.secureTabIndex) _.secureTabIndex(ap, false);
			t.setAttribute('aria-selected', true);
			return { panel: ap, tab: t };
		}
	};
	_.generateTabs = function (w) {
		var p = _.o.prefix,
		    n = document.createElement('nav'),
		    b = document.createElement('a'),
		    bt = document.createElement('button'),
		    h = window.location.hash || 0,
		    th = [],
		    cbt,
		    s,
		    id,
		    tn,
		    ctn;

		n.setAttribute('role', 'tablist');
		if (_.o.addClass) {
			n.classList.add(p + 'tabs__nav');
			b.classList.add(p + 'tabs__nav-item');
			bt.classList.add(p + 'tabs__btn--delete');
		}
		bt.setAttribute('role', 'button');
		bt.setAttribute('data-delPanel', 'delete current panel from document');

		bt.type = 'button';
		bt.onClick = _.handleUserEvent;
		s = w.children;

		if (!s[0].parentNode.querySelector('[aria-selected=true]')) {
			s[0].setAttribute('aria-selected', 'true');
		}
		for (var it = 0; it < s.length; it++) {
			if (!s[it].id) {
				s[it].id = 'w' + _.id + 's' + (it + 1);
			}

			id = s[it].id;
			if (h !== 0 && s[it].querySelector(h)) {
				th.push(id);
			}

			s[it].setAttribute('aria-labelledby', 'tab-' + id);
			s[it].setAttribute('role', 'tabpanel');

			tn = s[it].getAttribute('data-name') || it + 1;
			if (s[it].hasAttribute('data-deletion') && _.o.deleteBtn) {
				cbt = bt.cloneNode();
				cbt.innerHTML = _.o.deleteBtnString + '"' + tn + '"';
				s[it].insertBefore(cbt, s[it].firstChild);
			}

			ctn = b.cloneNode(true);
			ctn.href = '#' + id;
			ctn.innerHTML = tn;

			ctn.setAttribute('role', 'tab');
			ctn.id = 'tab-' + id;
			ctn.setAttribute('aria-controls', id);
			if (!s[it].hasAttribute('aria-selected')) {
				ctn.setAttribute('tabindex', '-1');
				ctn.setAttribute('aria-selected', false);
				s[it].setAttribute('aria-hidden', true);
				s[it].setAttribute('aria-selected', false);
				if (_.o.secureTabIndex) _.secureTabIndex(s[it], true);
			} else {
				ctn.setAttribute('aria-selected', true);
			}
			//ctn.onClick = _.bindClick;
			n.appendChild(ctn);
		}

		n.addEventListener('click', _.handleUserEvent, true);
		n.addEventListener('focus', _.handleUserEvent, true);
		n.addEventListener('keydown', _.handleUserEvent, true);

		w.addEventListener('keydown', _.handleUserEvent, true);
		w.addEventListener('keyup', _.handleUserEvent, true);
		w.addEventListener('click', _.handleUserEvent, true);
		w.addEventListener('focus', _.handleUserEvent, true);
		w.parentNode.insertBefore(n, w);

		if (th.length !== 0) {
			for (var i = 0; i < th.length; i++) {
				_.displayTab(document.getElementById('tab-' + th[i]));
			}
			h = document.getElementById(h.replace('#', ''));
			h.focus();
		}
	};
	/*
  	--------------------------------------------------------------------------
  	Optional Fonctionalities (you may want to delete them if you dont need it)
  	==========================================================================
  	--------------------------------------------------------------------------
  
  	gestion des animations
  	====================== 
 */
	_.animTimer = function () {
		this.classList.remove('isAnimated');
		if (this.getAttribute('aria-selected') === 'false') {
			this.setAttribute('aria-hidden', true);
		}
		this.removeEventListener(_.o.anim, _.animTimer, true);
	};

	_.animEvent = function () {
		var e,
		    el = document.createElement('fakeelement'),
		    events = {
			'animation': 'animationend',
			'OAnimation': 'oAnimationEnd',
			'MozAnimation': 'animationend',
			'WebkitTransition': 'webkitAnimationEnd'
		};

		for (e in events) {
			if (el.style[e] !== undefined) {
				return events[e];
			}
		}
	};
	/*
 	 	SecureTabIndex
 	 	============== 
 	 	
 	 	Set all focusable element in a node to tabindex=-1
 	 	or remove the tabindex ( based on lock = true || false)
 	 
 	 	Usefull only if an inactive panel doesn't have the style "display=none" specified (it should) for design purposes
 	 
 	 	you can activate this module by using  
 	 	'secureTabIndex: true'
 	 	in the option object
 	 
 	 	/!\ dont work with imbricated panels right now, or any elements with specified tabindex    
 */
	_.secureTabIndex = function (node, lock) {
		var c = node ? node.querySelectorAll('a, button, input, textarea, select') : 0;
		if (c.length) {
			for (var i = 0; i < c.length; i++) {
				if (lock) c[i].setAttribute('tabindex', '-1');else if (c[i].hasAttribute('tabindex')) c[i].removeAttribute('tabindex');
			}
		}
	};

	(function () {
		_.o.deleteBtnString = o.deleteBtnString || 'Delete ';
		_.o.target = _.o.target || '.a11ytabz';
		_.o.anim = _.o.anim ? _.animEvent() : false;
		_.o.prefix = _.o.prefix || '';
		_.o.deleteBtn = _.o.deleteBtn !== false ? true : _.o.deleteBtn;
		_.generateTabs(_.o.target);
	})();
	// fin du constructeur */
}

/*
 	Initialisation du script
 	========================
*/
/*	function pageLoaded() {
		var list = document.getElementsByClassName('tbz-tabs'),
		    options = {
		    	anim: true,
		    	hackSwitchTab: true 
		    },
		    nodeExample = document.getElementById('myTabPanelId'),
		    i;
		for ( i = 0; i < list.length; i++) {
			
			options.target = list[i];
			new TabPanel(options);
		}
		new TabPanel({target: nodeExample});

	}
	document.addEventListener('Load', pageLoaded());

/*
			 
	CallFunction Options
	====================
	the call function take an object as parameter
	var options = {
		//Mandatory

		target: node,   
		// targetedNode reference
		// Référence de l'élément a convertir
		//   ex : document.getElementById('MyTabPanels')	


		//Optional

		deleteBtn: true (default) || false, 
		// Désactive les boutons de suppression, (mais pas la fonctionalité, toujours accessible avec le raccourci [alt + supr])
		
		anim: true || false (default), 
		// Rajoute une classe "isAnimated" aux panneaux qui changent d'état et attend la fin d'une animation css3 pour la retirer et desactiver réelement le panneau.

		secureTabIndex: true || false (default), 
		// Active le module SecureTabIdex (cf description du module)

		deteleBtnString: 'Delete '
		// Chaine de caractère utilisé par les boutons de suppression comme texte ( défaut : 'Delete ') prendra la forme de 'Delete "tabName"' 

	};



	Panel attributes options
	========================
		
	activate option for a specific panel
	must be set on his panel target

		
	- id, a custom id for this panel 
	otherwhise, the script generate his own, such as :
	wWidgetNumbersSlideNumber ex : 
	id="w0s2" for the second panel of the first widget
	
	- data-name, a name for the panel, used by the tab element as inner value 
	
	- data-deletion can make a panel deletable, with regular keyboard shortcuts while on focus or a button in the panel ( buttons can be disabled in the callfunction options ) 
	
	- aria-selected : allow you to choose which panel will be activated on pageload 
	!only one of the widget's panel should have it
	
	- you can set your own class or data-attribute to style it, however, for compatibility purpose, its better to use the script generated aria-attributes and roles to achieve your tabs styling

	#todo 
		# Compatibilité, a tester sur safari et ie
	 	- classlist, animation et transition events 
	 	- ce que je trouverais 
*/
//# sourceMappingURL=app.js.map